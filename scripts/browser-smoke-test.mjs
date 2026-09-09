// Headless-Chromium (Playwright) smoke test that actually loads the app in a real JS engine and
// exercises it, instead of just fetching HTML like scripts/live-smoke-check.mjs does. Built after
// PR #256 shipped a boot-order regression (Firebase SDK loaded concurrently with ~30 dynamic
// import chunks) that npm run check:all / lint / build never could have caught, because none of
// those execute the app in a browser -- this does.
//
// It gives real JS execution, layout, mobile-viewport emulation, and CDP network
// throttling -- which covers the actual bug classes hit this session: uncaught JS exceptions
// (ReferenceError etc.), horizontal overflow / off-screen layout, the emoji-category-always-empty
// class of "renders but silently wrong" bug, and the boot-race class of bug.
//
// Read-only by design: every check here only loads pages and clicks UI that doesn't write to
// Firestore (opening a picker/lightbox, not sending/deleting/uploading). It runs against real
// production calendars (kkot/cw/jhair) the same way scripts/live-smoke-check.mjs already does, but
// never mutates their data. Actual write-flow testing (send/edit/delete/upload) would need a
// dedicated isolated calendar (see isInternalTestCalendarId's existing test_/stress_ prefix
// convention) and is intentionally out of scope for this script.
//
// Usage:
//   npm run build                          # produce dist/ (any base)
//   npm run smoke:browser                  # spawns `vite preview` against dist/ and tests it
//   CALENDAR_SMOKE_BASE_URL=https://pyw31337.github.io/calendar/ npm run smoke:browser
//                                           # skip local preview, test a already-deployed URL
//   CALENDAR_SMOKE_BROWSER=firefox npm run smoke:browser

import { chromium, firefox, webkit } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const EXPLICIT_BASE_URL = process.env.CALENDAR_SMOKE_BASE_URL || null;
const BROWSER_NAME = process.env.CALENDAR_SMOKE_BROWSER || 'chromium';
const BROWSER_TYPES = { chromium, firefox, webkit };
const DEPLOY_SCOPE = process.env.CALENDAR_SMOKE_SCOPE === 'deploy';
const LOCAL_PORT = process.env.CALENDAR_SMOKE_PORT || '4173';
const LOCAL_BASE_PATH = `/${String(process.env.CALENDAR_SMOKE_BASE_PATH || '').replace(/^\/+|\/+$/g, '')}`;
const LOCAL_BASE_URL = `http://127.0.0.1:${LOCAL_PORT}${LOCAL_BASE_PATH === '/' ? '/' : `${LOCAL_BASE_PATH}/`}`;

const CALENDARS = [
  ['kkot', '꽃잎반'],
  ['cw', '모아엘가'],
  ['jhair', '제이헤어']
];
const VIEWS = [
  { suffix: '', label: '메인' },
  { suffix: '&view=chat', label: '채팅' },
  { suffix: '&view=gallery', label: '갤러리' },
  { suffix: '&view=places', label: '장소' },
  { suffix: '&view=memo', label: '메모' },
  { suffix: '&view=settlement', label: '정산' },
  { suffix: '&view=history', label: '보관함' },
  { suffix: '&view=content', label: '컨텐츠' }
];
const VIEWPORTS = [
  { name: 'PC', width: 1440, height: 900, isMobile: false, hasTouch: false },
  {
    name: '모바일',
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  }
];

let failCount = 0;
let passCount = 0;
let knownExternalWarningCount = 0;
function pass(label) {
  passCount += 1;
  console.log(`  ✓ ${label}`);
}
function fail(label, detail) {
  failCount += 1;
  console.error(`  ✗ ${label} -- ${detail}`);
}
function isIgnorableConsoleError(text, url = '') {
  if (url.includes('firebasestorage.googleapis.com') && text.includes('status of 404')) {
    knownExternalWarningCount += 1;
    return true;
  }
  // Google faviconV2 is a best-effort decoration for externally shared links. Some source
  // sites have no resolvable icon and correctly return 404; it is unrelated to an app asset or
  // gallery image and must not turn an otherwise healthy navigation smoke red.
  if (/https:\/\/t\d+\.gstatic\.com\/faviconV2/.test(url) && text.includes('status of 404')) {
    knownExternalWarningCount += 1;
    return true;
  }
  if (BROWSER_NAME === 'webkit' && url.includes('gstatic.com/youtube/') && text.includes('access control checks')) {
    knownExternalWarningCount += 1;
    return true;
  }
  if (BROWSER_NAME === 'webkit' && text.includes('[Report Only] Refused to load')
    && text.includes('youtube.com/') && text.includes('Content Security Policy')) {
    knownExternalWarningCount += 1;
    return true;
  }
  return ['compute-pressure', 'Permissions policy', 'status of 503', 'status of 502',
    'ERR_NAME_NOT_RESOLVED', 'ERR_CONNECTION_REFUSED', 'downloadable font: download failed',
    'has been rejected because it is in a cross-site context', 'inline-speculation-rules']
    .some(marker => text.includes(marker));
}
function isActionableConsoleWarning(text) {
  return text.includes('You are overriding the original host');
}
function isKnownBrowserPageError(message) {
  if (/ResizeObserver loop (?:completed with undelivered notifications|limit exceeded)/i.test(message)) return true;
  if (BROWSER_NAME !== 'webkit') return false;
  if (/firestore\.googleapis\.com\/(?:google\.firestore\.v1\.Firestore\/(?:Listen|Write)\/channel|google\.firestore\.v1\.Firestore\/channel).*due to access control checks/i.test(message)) return true;
  // WebKit reports a SecurityError when TikTok's HTTPS embed script probes its parent while the
  // production build is exercised through Vite's local HTTP preview. The deployed site is HTTPS,
  // and this third-party iframe exception does not escape or affect the app frame.
  return /tiktok\.com[\s\S]*accessing a frame[\s\S]*protocols must match/i.test(message);
}
function collectSameOriginAsset404(response, baseUrl, bucket) {
  if (response.status() !== 404) return;
  const resourceType = response.request().resourceType();
  if (!['document', 'script', 'stylesheet', 'image', 'font', 'manifest'].includes(resourceType)) return;
  try {
    if (new URL(response.url()).origin !== new URL(baseUrl).origin) return;
  } catch (_) {
    return;
  }
  bucket.push(`${resourceType}: ${response.url()}`);
}
function mobileContextOptions(extra = {}) {
  return { viewport: { width: 390, height: 844 }, hasTouch: true,
    ...(BROWSER_NAME === 'firefox' ? {} : { isMobile: true }), ...extra };
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok || res.status === 404) return true;
    } catch (_) { /* not up yet */ }
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

async function gotoBootReady(page, url, timeoutMs = 35000) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(`${url}${attempt ? `${url.includes('?') ? '&' : '?'}_smokeRetry=1` : ''}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true, { timeout: timeoutMs });
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('boot-ready timeout');
}

async function checkPage(browser, baseUrl, viewport, calId, view) {
  const label = `[${viewport.name}] ${calId} ${view.label}`;
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    ...(BROWSER_NAME === 'firefox' ? {} : { isMobile: viewport.isMobile }),
    hasTouch: viewport.hasTouch,
    deviceScaleFactor: viewport.deviceScaleFactor || 1,
    ...(BROWSER_NAME === 'chromium' && viewport.userAgent ? { userAgent: viewport.userAgent } : {})
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const consoleWarnings = [];
  const pageErrors = [];
  const failedRequests = [];
  const asset404s = [];
  page.on('console', msg => {
    const loc = msg.location();
    if (msg.type() === 'error' && !isIgnorableConsoleError(msg.text(), loc?.url || '')) {
      consoleErrors.push(`${msg.text()}${loc?.url ? ` @${loc.url}:${loc.lineNumber || 0}` : ''}`);
    }
    if (msg.type() === 'warning' && isActionableConsoleWarning(msg.text())) {
      consoleWarnings.push(`${msg.text()}${loc?.url ? ` @${loc.url}:${loc.lineNumber || 0}` : ''}`);
    }
  });
  page.on('pageerror', err => {
    if (isKnownBrowserPageError(err.message)) {
      knownExternalWarningCount += 1;
      return;
    }
    pageErrors.push(err.message);
  });
  page.on('requestfailed', request => failedRequests.push(`${request.url()} (${request.failure()?.errorText || 'failed'})`));
  page.on('response', response => collectSameOriginAsset404(response, baseUrl, asset404s));

  const url = `${baseUrl}?id=${calId}${view.suffix}`;
  let bootError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(`${url}${attempt ? '&_smokeRetry=1' : ''}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true, { timeout: 35000 });
      bootError = null;
      break;
    } catch (err) {
      bootError = err;
    }
  }
  if (bootError) {
    fail(label, `page never reached boot-ready after retry: ${bootError.message}`);
    await context.close();
    return;
  }
  // give React a beat to settle any post-boot-ready fetches before measuring layout
  await page.waitForTimeout(500);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 2) fail(label, `가로 스크롤 발생 (화면 밖으로 ${overflow}px 벗어남)`);

  if (consoleErrors.length) fail(label, `콘솔 에러 ${consoleErrors.length}건: ${consoleErrors.slice(0, 2).join(' | ')}${failedRequests.length ? `; 요청 실패: ${failedRequests.filter(item => item.includes('ERR_INVALID_URL')).slice(0, 2).join(' | ') || failedRequests.slice(0, 2).join(' | ')}` : ''}`);
  if (consoleWarnings.length) fail(label, `조치 필요 콘솔 경고 ${consoleWarnings.length}건: ${consoleWarnings.slice(0, 2).join(' | ')}`);
  if (pageErrors.length) fail(label, `처리되지 않은 JS 예외 ${pageErrors.length}건: ${pageErrors.slice(0, 2).join(' | ')}`);
  if (asset404s.length) fail(label, `동일 출처 리소스 404 ${asset404s.length}건: ${asset404s.slice(0, 2).join(' | ')}`);

  if (!consoleErrors.length && !consoleWarnings.length && !pageErrors.length && !asset404s.length && overflow <= 2) pass(label);
  await context.close();
}

async function checkManifests(browser, baseUrl) {
  const context = await browser.newContext();
  for (const [id, expectedNameFragment] of CALENDARS) {
    try {
      const res = await context.request.get(`${baseUrl}manifest-${id}.json`);
      if (!res.ok()) { fail(`manifest-${id}.json`, `HTTP ${res.status()}`); continue; }
      const json = await res.json();
      if (typeof json.name !== 'string' || !json.name.includes(expectedNameFragment)) {
        fail(`manifest-${id}.json`, `name에 "${expectedNameFragment}"가 없음: ${json.name}`);
      } else if (!Array.isArray(json.icons) || json.icons.length === 0) {
        fail(`manifest-${id}.json`, 'icons 배열이 비어있음');
      } else {
        pass(`manifest-${id}.json (${json.name})`);
      }
    } catch (err) {
      fail(`manifest-${id}.json`, err.message);
    }
  }
  await context.close();
}

async function checkEmojiCategories(browser, baseUrl) {
  const label = '이모티콘 피커 전체 카테고리';
  const context = await browser.newContext(mobileContextOptions());
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}?id=kkot&view=chat`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true, { timeout: 25000 });
    const emojiButton = page.locator('button[title="이모티콘"]').first();
    await emojiButton.waitFor({ state: 'visible', timeout: 10000 });
    await emojiButton.dispatchEvent('click');
    const sheet = page.locator('.emoji-sheet');
    await sheet.waitFor({ state: 'visible', timeout: 5000 });
    // header + one group per EMOJI_CATEGORIES entry (+ recents if any exist) -- must be >1 or the
    // picker is falling back to an empty/near-empty category list (the PR #252 regression class).
    const groupCount = await sheet.locator(':scope > div > div').count();
    if (groupCount <= 1) fail(label, `카테고리 그룹이 ${groupCount}개뿐 (최근사용만 있거나 전부 비어있을 가능성)`);
    else pass(`${label} (${groupCount}개 그룹)`);
  } catch (err) {
    fail(label, err.message);
  } finally {
    await context.close();
  }
}

async function checkLightboxZoomControls(browser, baseUrl) {
  const label = '라이트박스 PC 줌 컨트롤';
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}?id=kkot`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true, { timeout: 25000 });
    const thumb = page.locator('img[alt="채팅에 첨부된 사진"]').first();
    const hasThumb = await thumb.count();
    if (!hasThumb) { console.log(`  (skip) ${label} -- 메인 갤러리에 사진이 없어 검사 생략`); await context.close(); return; }
    await thumb.click();
    await page.locator('img[alt="원본 이미지"]').first().click();
    await page.locator('button[title="확대"]').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('button[title="축소"]').waitFor({ state: 'visible', timeout: 5000 });
    pass(label);
    await page.keyboard.press('Escape');
  } catch (err) {
    fail(label, err.message);
  } finally {
    await context.close();
  }
}

async function checkPhotoCommentIsolation(browser, baseUrl) {
  const label = '사진별 댓글 키 격리';
  const context = await browser.newContext(mobileContextOptions());
  const page = await context.newPage();
  try {
    await gotoBootReady(page, `${baseUrl}?id=cw&view=gallery`);
    const result = await page.evaluate(() => {
      const getIdentity = window.GATHER_UI_DEPS?.getPhotoCommentIdentity;
      if (typeof getIdentity !== 'function') return { error: '댓글 식별 헬퍼가 번들에 연결되지 않음' };
      const photos = Array.from({ length: 6 }, (_, index) => ({
        source: 'gallery',
        messageId: 'duplicated-batch-meta',
        imageIndex: 0,
        full: `https://firebasestorage.googleapis.com/v0/b/example/o/browser_${index}.jpg?alt=media&token=${index}`
      }));
      const identities = photos.map(photo => getIdentity(photo, photos));
      return {
        keyCount: new Set(identities.map(identity => identity.mediaKey)).size,
        legacyFallbackCount: identities.reduce((sum, identity) => sum + (identity.legacyKeys?.length || 0), 0)
      };
    });
    if (result.error) fail(label, result.error);
    else if (result.keyCount !== 6 || result.legacyFallbackCount !== 0) fail(label, `6개 사진이 ${result.keyCount}개 댓글창으로 식별됨; 모호한 구형 키 ${result.legacyFallbackCount}개`);
    else pass(label);
  } catch (err) {
    fail(label, err.message);
  } finally {
    await context.close();
  }
}

async function checkDeferredManual(browser, baseUrl) {
  const label = '사용자 매뉴얼 지연 chunk 로딩';
  const context = await browser.newContext(mobileContextOptions());
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}?id=kkot`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true, { timeout: 35000 });
    const menuButton = page.locator('button[aria-label$="메뉴 열기"]:visible').first();
    await menuButton.waitFor({ state: 'visible', timeout: 8000 });
    await menuButton.dispatchEvent('click');
    const menu = page.locator('.admin-side-menu-overlay > .admin-side-menu:visible').last();
    await menu.waitFor({ state: 'visible', timeout: 8000 });
    await menu.locator('text=사용자 매뉴얼').first().click();
    await page.locator('.manual-panel:visible').waitFor({ state: 'visible', timeout: 10000 });
    pass(label);
  } catch (err) {
    fail(label, err.message);
  } finally {
    await context.close();
  }
}

async function checkMemoTagInput(browser, baseUrl) {
  const label = '메모 작성 태그입력 모듈';
  const context = await browser.newContext(mobileContextOptions());
  const page = await context.newPage();
  try {
    await gotoBootReady(page, `${baseUrl}?id=kkot&view=memo`);
    await page.getByText('새로운 메모를 남겨보세요...', { exact: true }).click();

    const participantButton = page.getByRole('button', { name: '작성자 선택' });
    const tagInput = page.getByPlaceholder('태그 입력 (0/10)', { exact: true });
    await participantButton.waitFor({ state: 'visible', timeout: 5000 });
    await tagInput.waitFor({ state: 'visible', timeout: 5000 });
    await tagInput.fill('회귀검사');
    await tagInput.locator('..').getByRole('button', { name: '저장', exact: true }).click();
    await page.getByText('#회귀검사', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });

    // Close without saving the memo: this check exercises only the local composer state.
    await page.getByRole('button', { name: '닫기', exact: true }).click();
    pass(label);
  } catch (err) {
    fail(label, err.message);
  } finally {
    await context.close();
  }
}

async function checkSettlementModalEntryPoints(browser, baseUrl) {
  for (const viewport of VIEWPORTS) {
    const label = `[${viewport.name}] 정산 생성·수정 레이어`;
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      ...(BROWSER_NAME === 'firefox' ? {} : { isMobile: viewport.isMobile }),
      hasTouch: viewport.hasTouch,
      deviceScaleFactor: viewport.deviceScaleFactor || 1,
      ...(BROWSER_NAME === 'chromium' && viewport.userAgent ? { userAgent: viewport.userAgent } : {})
    });
    const page = await context.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() !== 'error') return;
      const loc = msg.location();
      if (!isIgnorableConsoleError(msg.text(), loc?.url || '')) errors.push(msg.text());
    });
    page.on('pageerror', err => {
      if (isKnownBrowserPageError(err.message)) knownExternalWarningCount += 1;
      else errors.push(err.message);
    });
    try {
      await gotoBootReady(page, `${baseUrl}?id=kkot&view=settlement`);

      const editButton = page.locator('[data-settlement-edit-button="true"]').first();
      await editButton.waitFor({ state: 'visible', timeout: 10000 });
      await editButton.click();
      const editDialog = page.locator('[role="dialog"]').filter({ hasText: '정산 수정' }).first();
      await editDialog.waitFor({ state: 'visible', timeout: 5000 });
      await editDialog.locator('button').filter({ hasText: '취소' }).first().click();
      await editDialog.waitFor({ state: 'hidden', timeout: 5000 });

      const menuButton = page.locator('button[aria-label$="메뉴 열기"]:visible, button[aria-label="메뉴"]:visible').first();
      await menuButton.click();
      const menu = page.locator('.admin-side-menu-overlay > .admin-side-menu:visible').last();
      await menu.waitFor({ state: 'visible', timeout: 5000 });
      await menu.locator('button.admin-side-menu-item').filter({ hasText: '정산 생성' }).first().click();
      const createDialog = page.locator('[role="dialog"]').filter({ hasText: '정산 생성' }).first();
      await createDialog.waitFor({ state: 'visible', timeout: 5000 });
      await createDialog.locator('button').filter({ hasText: '취소' }).first().click();
      await createDialog.waitFor({ state: 'hidden', timeout: 5000 });

      if (errors.length) fail(label, `콘솔/페이지 오류 ${errors.length}건: ${errors.slice(0, 2).join(' | ')}`);
      else pass(label);
    } catch (err) {
      fail(label, err.message);
    } finally {
      await context.close();
    }
  }
}

async function checkSideMenuNavigation(browser, baseUrl) {
  const sources = [
    ['', '메인'],
    ['&view=chat', '채팅'],
    ['&view=gallery', '갤러리'],
    ['&view=places', '장소'],
    ['&view=memo', '메모'],
    ['&view=settlement', '정산']
  ];
  const selectedSources = DEPLOY_SCOPE
    ? sources.filter(([, label]) => ['메인', '채팅', '갤러리'].includes(label))
    : sources;
  const destinations = ['채팅', '갤러리', '장소', '메모', '정산'];
  for (const viewport of VIEWPORTS) {
    for (const [calId] of CALENDARS) {
      if (DEPLOY_SCOPE && calId !== 'cw') continue;
      const label = `[${viewport.name}] ${calId} 사이드메뉴 전환`;
      for (const [suffix, sourceLabel] of selectedSources) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          ...(BROWSER_NAME === 'firefox' ? {} : { isMobile: viewport.isMobile }),
          hasTouch: viewport.hasTouch,
          deviceScaleFactor: viewport.deviceScaleFactor || 1,
          ...(BROWSER_NAME === 'chromium' && viewport.userAgent ? { userAgent: viewport.userAgent } : {})
        });
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        const failedRequests = [];
        const asset404s = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            const loc = msg.location();
            if (isIgnorableConsoleError(msg.text(), loc?.url || '')) return;
            consoleErrors.push(`${msg.text()}${loc?.url ? ` @${loc.url}:${loc.lineNumber || 0}` : ''}`);
          }
        });
        page.on('pageerror', err => {
          if (isKnownBrowserPageError(err.message)) {
            knownExternalWarningCount += 1;
            return;
          }
          pageErrors.push(err.message);
        });
        page.on('requestfailed', request => failedRequests.push(`${request.url()} (${request.failure()?.errorText || 'failed'})`));
        page.on('response', response => collectSameOriginAsset404(response, baseUrl, asset404s));
        try {
          await gotoBootReady(page, `${baseUrl}?id=${calId}${suffix}`);
          const menuButton = page.locator('button[aria-label$="메뉴 열기"]:visible, button[aria-label="메뉴"]:visible').first();
          await menuButton.waitFor({ state: 'visible', timeout: 8000 });
          // Mobile headers can still be settling after a view transition; dispatch the semantic
          // click after the visibility check so a transient scroll/animation does not make the
          // read-only navigation smoke test report a false failure.
          await page.waitForTimeout(250);
          await menuButton.dispatchEvent('click');
          const menu = page.locator('.admin-side-menu-overlay > .admin-side-menu:visible').last();
          await menu.waitFor({ state: 'visible', timeout: 10000 });
          for (const destination of destinations) {
            await menu.locator('button.admin-side-menu-item').filter({ hasText: destination }).first().waitFor({ state: 'visible', timeout: 5000 });
          }
          if (consoleErrors.length || pageErrors.length || asset404s.length) {
            const details = [...consoleErrors, ...pageErrors].slice(0, 2).join(' | ');
            fail(`${label}: ${sourceLabel}`, `메뉴 확인 후 콘솔/페이지 오류 ${consoleErrors.length + pageErrors.length}건: ${details}${asset404s.length ? `; 동일 출처 리소스 404: ${asset404s.slice(0, 2).join(' | ')}` : ''}${failedRequests.length ? `; 요청 실패: ${failedRequests.filter(item => item.includes('ERR_INVALID_URL')).slice(0, 2).join(' | ') || failedRequests.slice(0, 2).join(' | ')}` : ''}`);
          } else {
            pass(`${label}: ${sourceLabel}`);
          }
        } catch (err) {
          fail(`${label}: ${sourceLabel}`, err.message);
        } finally {
          await context.close();
        }
      }
    }
  }
}

async function checkThrottledBoot(browser, baseUrl) {
  const label = '저속 네트워크(슬로우 3G급) 모바일 부팅';
  const context = await browser.newContext(mobileContextOptions({ userAgent: VIEWPORTS[1].userAgent }));
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  try {
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 400,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (100 * 1024) / 8
    });
    const start = Date.now();
    await page.goto(`${baseUrl}?id=kkot`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true, { timeout: 55000 });
    pass(`${label} (${Date.now() - start}ms)`);
  } catch (err) {
    fail(label, `저속 회선에서 부팅 실패/타임아웃: ${err.message}`);
  } finally {
    await context.close();
  }
}

async function ensureLocalServer() {
  const up = await waitForServer(LOCAL_BASE_URL, 1000);
  if (up) return { baseUrl: LOCAL_BASE_URL, proc: null };
  console.log(`[browser-smoke-test] 로컬 미리보기 서버 시작 (vite preview --port ${LOCAL_PORT}) ...`);
  const viteBin = path.join(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  // Spawn Vite itself instead of `npx vite`. On Linux runners npx can leave the Vite child
  // alive after npx receives SIGTERM, keeping its stdout pipe open and hanging the workflow.
  const proc = spawn(process.execPath, [viteBin, 'preview', '--host', '127.0.0.1', '--port', LOCAL_PORT, '--strictPort'], {
    cwd: repoRoot,
    // The Pages build uses an absolute subpath. Vite preview evaluates vite.config.js again,
    // so it must receive the same base or it serves the built HTML at `/` while every
    // `/calendar/assets/*` request falls through to that HTML and the app never boots.
    env: {
      ...process.env,
      ...(LOCAL_BASE_PATH === '/' ? {} : { VITE_BASE_PATH: `${LOCAL_BASE_PATH}/` })
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });
  let previewOutput = '';
  const capturePreviewOutput = chunk => {
    previewOutput = `${previewOutput}${String(chunk)}`.slice(-4000);
  };
  proc.stdout.on('data', capturePreviewOutput);
  proc.stderr.on('data', capturePreviewOutput);
  const ready = await waitForServer(LOCAL_BASE_URL, 20000);
  if (!ready) {
    proc.kill();
    throw new Error(`로컬 미리보기 서버가 ${LOCAL_BASE_URL} 에서 응답하지 않음: ${previewOutput.trim() || '출력 없음'}`);
  }
  return { baseUrl: LOCAL_BASE_URL, proc };
}

async function main() {
  let localProc = null;
  let baseUrl = EXPLICIT_BASE_URL;
  if (!baseUrl) {
    const server = await ensureLocalServer();
    baseUrl = server.baseUrl;
    localProc = server.proc;
  }
  const browserType = BROWSER_TYPES[BROWSER_NAME];
  if (!browserType) throw new Error(`지원하지 않는 브라우저 엔진: ${BROWSER_NAME}`);
  console.log(`[browser-smoke-test] target: ${baseUrl} (${BROWSER_NAME})\n`);
  if (DEPLOY_SCOPE) console.log('[browser-smoke-test] scope: deploy-critical (full matrix runs locally)\n');

  const browser = await browserType.launch();
  try {
    console.log('-- 페이지 렌더 / 콘솔 에러 / 레이아웃 오버플로우 --');
    for (const viewport of VIEWPORTS) {
      for (const [calId] of CALENDARS) {
        for (const view of VIEWS) {
          if (DEPLOY_SCOPE && !(viewport.name === 'PC' && calId === 'cw')
            && !['메인', '채팅', '갤러리'].includes(view.label)) continue;
          await checkPage(browser, baseUrl, viewport, calId, view);
        }
      }
    }

    console.log('\n-- PWA manifest --');
    await checkManifests(browser, baseUrl);

    console.log('\n-- 상호작용 스모크 (읽기 전용) --');
    await checkEmojiCategories(browser, baseUrl);
    await checkLightboxZoomControls(browser, baseUrl);
    await checkPhotoCommentIsolation(browser, baseUrl);
    await checkDeferredManual(browser, baseUrl);
    await checkMemoTagInput(browser, baseUrl);
    await checkSettlementModalEntryPoints(browser, baseUrl);
    await checkSideMenuNavigation(browser, baseUrl);

    if (BROWSER_NAME === 'chromium') {
      console.log('\n-- 저속 네트워크 부팅 경쟁 상태 --');
      await checkThrottledBoot(browser, baseUrl);
    }
  } finally {
    await browser.close();
    if (localProc) localProc.kill();
  }

  console.log(`\n[browser-smoke-test] ${passCount} passed, ${failCount} failed`
    + (knownExternalWarningCount ? `, ${knownExternalWarningCount} known external-resource warning(s)` : ''));
  if (failCount > 0) process.exit(1);
  // Playwright, service workers, and Firestore transports can leave platform-specific handles
  // alive on Linux runners after every assertion and browser close has completed. This script is
  // a one-shot CLI, so terminate explicitly after the final result instead of delaying deployment.
  process.exit(0);
}

main().catch(err => {
  console.error('[browser-smoke-test] fatal:', err);
  process.exit(1);
});
