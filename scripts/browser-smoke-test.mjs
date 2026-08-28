// Headless-Chromium (Playwright) smoke test that actually loads the app in a real JS engine and
// exercises it, instead of just fetching HTML like scripts/live-smoke-check.mjs does. Built after
// PR #256 shipped a boot-order regression (Firebase SDK loaded concurrently with ~30 dynamic
// import chunks) that npm run check:all / lint / build never could have caught, because none of
// those execute the app in a browser -- this does.
//
// Scope, honestly: only Chromium is installed in this environment (see /opt/pw-browsers), so this
// cannot reproduce real Safari/iOS, Firefox, Samsung Internet, Whale, or an actual physical PWA
// install. It DOES give real JS execution, real layout, mobile-viewport emulation, and CDP network
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

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const EXPLICIT_BASE_URL = process.env.CALENDAR_SMOKE_BASE_URL || null;
const LOCAL_PORT = process.env.CALENDAR_SMOKE_PORT || '4173';
const LOCAL_BASE_URL = `http://127.0.0.1:${LOCAL_PORT}/`;

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
  { suffix: '&view=memo', label: '메모' }
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
function pass(label) {
  passCount += 1;
  console.log(`  ✓ ${label}`);
}
function fail(label, detail) {
  failCount += 1;
  console.error(`  ✗ ${label} -- ${detail}`);
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

async function checkPage(browser, baseUrl, viewport, calId, view) {
  const label = `[${viewport.name}] ${calId} ${view.label}`;
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
    deviceScaleFactor: viewport.deviceScaleFactor || 1,
    userAgent: viewport.userAgent
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('compute-pressure') && !msg.text().includes('Permissions policy') && !msg.text().includes('status of 503') && !msg.text().includes('status of 502') && !msg.text().includes('ERR_NAME_NOT_RESOLVED') && !msg.text().includes('ERR_CONNECTION_REFUSED')) { const loc = msg.location(); consoleErrors.push(`${msg.text()}${loc?.url ? ` @${loc.url}:${loc.lineNumber || 0}` : ''}`); } });
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('requestfailed', request => failedRequests.push(`${request.url()} (${request.failure()?.errorText || 'failed'})`));

  const url = `${baseUrl}?id=${calId}${view.suffix}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // eslint-disable-next-line no-undef -- runs inside the browser page (Playwright evaluate/waitForFunction), not Node
    await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true, { timeout: 35000 });
  } catch (err) {
    fail(label, `page never reached boot-ready: ${err.message}`);
    await context.close();
    return;
  }
  // give React a beat to settle any post-boot-ready fetches before measuring layout
  await page.waitForTimeout(500);

  // eslint-disable-next-line no-undef -- runs inside the browser page (Playwright evaluate/waitForFunction), not Node
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 2) fail(label, `가로 스크롤 발생 (화면 밖으로 ${overflow}px 벗어남)`);

  if (consoleErrors.length) fail(label, `콘솔 에러 ${consoleErrors.length}건: ${consoleErrors.slice(0, 2).join(' | ')}${failedRequests.length ? `; 요청 실패: ${failedRequests.filter(item => item.includes('ERR_INVALID_URL')).slice(0, 2).join(' | ') || failedRequests.slice(0, 2).join(' | ')}` : ''}`);
  if (pageErrors.length) fail(label, `처리되지 않은 JS 예외 ${pageErrors.length}건: ${pageErrors.slice(0, 2).join(' | ')}`);

  if (!consoleErrors.length && !pageErrors.length && overflow <= 2) pass(label);
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
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}?id=kkot&view=chat`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // eslint-disable-next-line no-undef -- runs inside the browser page (Playwright evaluate/waitForFunction), not Node
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
    // eslint-disable-next-line no-undef -- runs inside the browser page (Playwright evaluate/waitForFunction), not Node
    await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true, { timeout: 25000 });
    const thumb = page.locator('img[alt="채팅에 첨부된 사진"]').first();
    const hasThumb = await thumb.count();
    if (!hasThumb) { console.log(`  (skip) ${label} -- 메인 갤러리에 사진이 없어 검사 생략`); await context.close(); return; }
    await thumb.click();
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

async function checkDeferredManual(browser, baseUrl) {
  const label = '사용자 매뉴얼 지연 chunk 로딩';
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
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

async function checkSideMenuNavigation(browser, baseUrl) {
  const sources = [
    ['', '메인'],
    ['&view=chat', '채팅'],
    ['&view=gallery', '갤러리'],
    ['&view=places', '장소'],
    ['&view=memo', '메모']
  ];
  const destinations = ['채팅', '갤러리', '장소', '메모'];
  for (const viewport of VIEWPORTS) {
    for (const [calId] of CALENDARS) {
      const label = `[${viewport.name}] ${calId} 사이드메뉴 전환`;
      for (const [suffix, sourceLabel] of sources) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          isMobile: viewport.isMobile,
          hasTouch: viewport.hasTouch,
          deviceScaleFactor: viewport.deviceScaleFactor || 1,
          userAgent: viewport.userAgent
        });
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        const failedRequests = [];
        page.on('console', msg => {
          if (msg.type() === 'error' && !msg.text().includes('compute-pressure') && !msg.text().includes('Permissions policy')) {
            const loc = msg.location();
            consoleErrors.push(`${msg.text()}${loc?.url ? ` @${loc.url}:${loc.lineNumber || 0}` : ''}`);
          }
        });
        page.on('pageerror', err => pageErrors.push(err.message));
        page.on('requestfailed', request => failedRequests.push(`${request.url()} (${request.failure()?.errorText || 'failed'})`));
        try {
          await page.goto(`${baseUrl}?id=${calId}${suffix}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
          // eslint-disable-next-line no-undef -- runs inside the browser page (Playwright evaluate/waitForFunction), not Node
          await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true, { timeout: 35000 });
          const menuButton = page.locator('button[aria-label$="메뉴 열기"]:visible').first();
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
          if (consoleErrors.length || pageErrors.length) {
            fail(`${label}: ${sourceLabel}`, `메뉴 확인 후 콘솔/페이지 오류 ${consoleErrors.length + pageErrors.length}건${failedRequests.length ? `; 요청 실패: ${failedRequests.filter(item => item.includes('ERR_INVALID_URL')).slice(0, 2).join(' | ') || failedRequests.slice(0, 2).join(' | ')}` : ''}`);
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
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: VIEWPORTS[1].userAgent
  });
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
    // eslint-disable-next-line no-undef -- runs inside the browser page (Playwright evaluate/waitForFunction), not Node
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
  const proc = spawn('npx', ['vite', 'preview', '--port', LOCAL_PORT, '--strictPort'], {
    cwd: repoRoot,
    stdio: 'ignore',
    detached: false
  });
  const ready = await waitForServer(LOCAL_BASE_URL, 20000);
  if (!ready) {
    proc.kill();
    throw new Error(`로컬 미리보기 서버가 ${LOCAL_BASE_URL} 에서 응답하지 않음 (dist/ 빌드가 되어 있는지 확인)`);
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
  console.log(`[browser-smoke-test] target: ${baseUrl}\n`);

  const browser = await chromium.launch();
  try {
    console.log('-- 페이지 렌더 / 콘솔 에러 / 레이아웃 오버플로우 --');
    for (const viewport of VIEWPORTS) {
      for (const [calId] of CALENDARS) {
        for (const view of VIEWS) {
          await checkPage(browser, baseUrl, viewport, calId, view);
        }
      }
    }

    console.log('\n-- PWA manifest --');
    await checkManifests(browser, baseUrl);

    console.log('\n-- 상호작용 스모크 (읽기 전용) --');
    await checkEmojiCategories(browser, baseUrl);
    await checkLightboxZoomControls(browser, baseUrl);
    await checkDeferredManual(browser, baseUrl);
    await checkSideMenuNavigation(browser, baseUrl);

    console.log('\n-- 저속 네트워크 부팅 경쟁 상태 --');
    await checkThrottledBoot(browser, baseUrl);
  } finally {
    await browser.close();
    if (localProc) localProc.kill();
  }

  console.log(`\n[browser-smoke-test] ${passCount} passed, ${failCount} failed`);
  if (failCount > 0) process.exit(1);
}

main().catch(err => {
  console.error('[browser-smoke-test] fatal:', err);
  process.exit(1);
});
