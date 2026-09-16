import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.PHASE0_BASE || 'http://127.0.0.1:4173';
const OUT = 'designv2/parity-shots/phase0-mobile';
const MOBILE = { width: 390, height: 844, isMobile: true, hasTouch: true };

const screens = [
  { id: 'chat', path: (shell) => `/?id=cw${shell}&tab=chat` },
  { id: 'memo', path: (shell) => `/?id=cw${shell}&tab=memo` },
  { id: 'gallery', path: (shell) => `/?id=cw${shell}&tab=records&sub=media` },
  { id: 'places', path: (shell) => `/?id=cw${shell}&tab=places` },
  { id: 'settlement', path: (shell) => `/?id=cw${shell}&tab=settlement` },
  { id: 'content', path: (shell) => `/?id=cw${shell}&tab=records&sub=content` },
  { id: 'side-menu', path: (shell) => `/?id=cw${shell}&tab=calendar`, openMenu: true },
];

async function dismissOverlays(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);
  // close any toast/modal if present
  for (const sel of ['.modal-close', '[aria-label="닫기"]', 'button:has-text("닫기")']) {
    const el = page.locator(sel).first();
    if (await el.count() && await el.isVisible().catch(() => false)) {
      await el.click().catch(() => {});
    }
  }
}

async function openSideMenu(page, isV2) {
  if (isV2) {
    // hamburger in header or open side-nav button
    const candidates = [
      '.bp-side-nav-open-btn',
      'button[aria-label*="메뉴"]',
      'button[aria-label*="사이드"]',
      '.v2-page-header button:has(svg)',
      'header button',
    ];
    for (const sel of candidates) {
      const btn = page.locator(sel).last();
      if (await btn.count()) {
        await btn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(500);
        if (await page.locator('.bp-side-nav.bp-is-open, .bp-side-nav').first().isVisible().catch(() => false)) return true;
      }
    }
    // try clicking hamburger icons in page
    const hamburgers = page.locator('button').filter({ has: page.locator('svg') });
    const n = await hamburgers.count();
    for (let i = n - 1; i >= Math.max(0, n - 8); i--) {
      await hamburgers.nth(i).click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
      if (await page.locator('.bp-side-nav.bp-is-open, .side-menu.open, .drawer-open, [class*="side-menu"]').first().isVisible().catch(() => false)) return true;
    }
    return false;
  }
  // default shell: hamburger typically top-right
  const btn = page.locator('button[aria-label*="메뉴"], .menu-btn, button:has-text("☰")').first();
  if (await btn.count()) {
    await btn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    return true;
  }
  // fallback: last header button
  const headerBtns = page.locator('header button, .app-header button, .top-bar button');
  const count = await headerBtns.count();
  if (count > 0) {
    await headerBtns.nth(count - 1).click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    return true;
  }
  return false;
}

async function captureShell(shellLabel, shellQuery) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: MOBILE.width, height: MOBILE.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();
  const report = {};
  for (const s of screens) {
    const url = `${BASE}${s.path(shellQuery)}`;
    console.log(`[${shellLabel}] goto`, url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(4500);
    await dismissOverlays(page);
    if (s.openMenu) {
      const opened = await openSideMenu(page, shellLabel === 'v2');
      report[s.id] = { opened };
      await page.waitForTimeout(600);
    } else {
      const info = await page.evaluate(() => {
        const text = (el) => (el?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120);
        const header = document.querySelector('.v2-page-header, .bp-header, header, .page-header, .app-header');
        const tags = document.querySelectorAll('.bp-tag-chip, .memo-tag-chip, .tag-chip, [class*="tag-filter"] button, [class*="tag-cloud"] *');
        const fab = document.querySelector('.bp-fab, .fab, [class*="fab"]');
        const rail = document.querySelector('.bp-side-nav');
        const fakeFilters = [...document.querySelectorAll('button, [role="button"]')].filter(b => {
          const t = (b.getAttribute('aria-label') || b.title || '').toLowerCase();
          return /filter|필터|sort|정렬/.test(t);
        }).map(b => (b.getAttribute('aria-label') || b.title || b.innerText || '').trim().slice(0, 40));
        return {
          title: text(header),
          tagChipCount: tags.length,
          hasFab: !!fab,
          railDisplay: rail ? getComputedStyle(rail).display : null,
          railOpen: rail?.classList.contains('bp-is-open') || false,
          fakeFilters,
          bodyClass: document.body.className,
          rootClass: document.documentElement.className,
          v2: !!document.querySelector('.v2-design'),
        };
      });
      report[s.id] = info;
    }
    const dir = `${OUT}/${shellLabel}`;
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/${s.id}.png`, fullPage: false });
    console.log(`[${shellLabel}] shot`, s.id, JSON.stringify(report[s.id]));
  }
  fs.writeFileSync(`${OUT}/${shellLabel}-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}

await captureShell('default', '');
await captureShell('v2', '&shell=v2');
console.log('done');
