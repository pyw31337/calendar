import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'https://pyw31337.github.io/calendar';
const OUT = 'designv2/parity-shots/unit-loop/header-module';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { base: BASE, mergeSha: '94ce65be', capturedAt: new Date().toISOString(), shots: {} };

async function waitReady(page) {
  await page.waitForSelector('.v2-design', { timeout: 45000 });
  await page.waitForTimeout(3200);
}

async function measure(page, kind) {
  return page.evaluate((kind) => {
    const qs = (s) => document.querySelector(s);
    const header = qs('.v2-page-header');
    const brand = qs('.bp-side-nav-brand');
    const badge = qs('.bp-side-nav-cal-badge');
    const sub = qs('.v2-page-header .bp-header-sub');
    const composer = qs('.v2-chat-composer, .chat-composer.v2-chat-composer');
    const title = qs('.v2-page-header .bp-header-title');
    return {
      kind,
      headerTitle: (title?.textContent || '').trim(),
      headerSub: (sub?.textContent || '').trim(),
      brandText: (brand?.innerText || '').replace(/\s+/g, ' ').trim(),
      calBadge: (badge?.textContent || '').trim(),
      hasComposer: !!composer,
      searchAria: [...document.querySelectorAll('.v2-page-header .bp-icon-btn')].map(b => b.getAttribute('aria-label')),
    };
  }, kind);
}

// PC chat 1280x800
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?id=cw&shell=v2&tab=chat&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  // open side-nav if collapsed on PC it should already show
  await page.screenshot({ path: `${OUT}/chat-pc.png`, fullPage: false });
  report.shots['chat-pc'] = await measure(page, 'chat-pc');
  await ctx.close();
}

// Mobile chat + memo
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?id=cw&shell=v2&tab=chat&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  await page.screenshot({ path: `${OUT}/chat-mobile.png`, fullPage: false });
  report.shots['chat-mobile'] = await measure(page, 'chat-mobile');

  await page.goto(`${BASE}/?id=cw&shell=v2&tab=memo&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  await page.screenshot({ path: `${OUT}/memo-header.png`, fullPage: false });
  report.shots['memo-header'] = await measure(page, 'memo-header');
  await ctx.close();
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
