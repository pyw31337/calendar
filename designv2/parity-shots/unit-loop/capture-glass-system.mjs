import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'http://127.0.0.1:5188';
const OUT = 'designv2/parity-shots/unit-loop/glass-system';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { base: BASE, capturedAt: new Date().toISOString(), shots: {} };

async function settle(page, sel, ms = 2500) {
  await page.waitForTimeout(ms);
  try { await page.waitForSelector(sel, { timeout: 15000 }); } catch {}
  await page.waitForTimeout(600);
}

async function measureGlass(page) {
  return page.evaluate(() => {
    const qs = (s) => document.querySelector(s);
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const root = qs('.v2-design');
    const active = qs('.bp-side-nav-item.bp-is-active');
    const badge = qs('.bp-side-nav-cal-badge');
    const collapse = qs('.bp-side-nav-collapse-btn');
    const headerIcon = qs('.v2-page-header .bp-icon-btn');
    const fab = qs('.bp-fab');
    const send = qs('.bp-composer-send, .v2-chat-compose-row > button:last-child');
    const memoCard = qs('.v2-memo .memo-card-hover, .v2-memo .bp-memo-card');
    const tokens = root
      ? {
          brand: cs(root).getPropertyValue('--brand').trim(),
          primary: cs(root).getPropertyValue('--v2-primary').trim(),
          lightBorder: cs(root).getPropertyValue('--v2-glass-light-border').trim(),
          purpleFill: cs(root).getPropertyValue('--v2-glass-purple-fill').trim(),
        }
      : null;
    return {
      tokens,
      active: active
        ? { bg: cs(active).backgroundColor, border: cs(active).borderColor }
        : null,
      badge: badge
        ? { color: cs(badge).color, border: cs(badge).borderColor }
        : null,
      collapse: collapse
        ? { border: cs(collapse).borderColor, bg: cs(collapse).backgroundColor }
        : null,
      headerIcon: headerIcon
        ? { bg: cs(headerIcon).backgroundColor, border: cs(headerIcon).borderColor, filter: cs(headerIcon).backdropFilter }
        : null,
      fab: fab
        ? { bg: cs(fab).backgroundColor, shadow: cs(fab).boxShadow }
        : null,
      send: send
        ? { bg: cs(send).backgroundColor, shadow: cs(send).boxShadow }
        : null,
      memoCard: memoCard
        ? { border: cs(memoCard).borderColor, shadow: cs(memoCard).boxShadow }
        : null,
    };
  });
}

// 1) Side-nav on home (PC)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?id=cw&shell=v2&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page, '.v2-design .bp-side-nav');
  // ensure side nav open
  const nav = page.locator('.bp-side-nav');
  if (await nav.count()) {
    await nav.screenshot({ path: `${OUT}/side-nav-pc.png` });
  }
  report.shots.sideNavHome = await measureGlass(page);
  await ctx.close();
}

// 2) Chat header icons
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?id=cw&shell=v2&tab=chat&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page, '.v2-page-header');
  const header = page.locator('.v2-page-header');
  if (await header.count()) {
    await header.screenshot({ path: `${OUT}/chat-header-icons-pc.png` });
  }
  await page.screenshot({ path: `${OUT}/chat-full-pc.png`, fullPage: false });
  report.shots.chatHeader = await measureGlass(page);
  await ctx.close();
}

// 3) Memo FAB + card
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?id=cw&shell=v2&tab=memo&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page, '.v2-memo');
  const fab = page.locator('.bp-fab');
  if (await fab.count()) {
    await fab.screenshot({ path: `${OUT}/memo-fab-pc.png` });
  }
  const card = page.locator('.v2-memo .memo-card-hover, .v2-memo .bp-memo-card').first();
  if (await card.count()) {
    await card.screenshot({ path: `${OUT}/memo-card-pc.png` });
  }
  await page.screenshot({ path: `${OUT}/memo-full-pc.png`, fullPage: false });
  report.shots.memo = await measureGlass(page);
  await ctx.close();
}

// 4) Places FAB
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?id=cw&shell=v2&tab=places&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await settle(page, '.v2-places');
  const fab = page.locator('.bp-fab');
  if (await fab.count()) {
    await fab.screenshot({ path: `${OUT}/places-fab-pc.png` });
  }
  await page.screenshot({ path: `${OUT}/places-full-pc.png`, fullPage: false });
  report.shots.places = await measureGlass(page);
  await ctx.close();
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
