import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'http://127.0.0.1:4173/calendar/';
const OUT = 'designv2/parity-shots/unit-loop/hero-glass';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { base: BASE, capturedAt: new Date().toISOString(), shots: {} };

async function waitReady(page) {
  await page.waitForSelector('.v2-design .bp-hero-zone', { timeout: 60000 });
  await page.waitForTimeout(3500);
}

async function measure(page, kind) {
  return page.evaluate((kind) => {
    const qs = (s) => document.querySelector(s);
    const hero = qs('.bp-hero-zone');
    const compact = qs('.bp-dday-compact');
    const badge = qs('.bp-dday-compact-badge');
    const prefix = qs('.bp-dday-compact-prefix');
    const detail = qs('.bp-dday-compact-detail');
    const text = qs('.bp-dday-compact-text');
    const legend = [...document.querySelectorAll('.bp-cal-legend > span')].map((el) => {
      const dot = el.querySelector('.bp-dot');
      const cs = dot ? getComputedStyle(dot) : null;
      return { label: (el.textContent || '').trim(), bg: cs?.backgroundColor || null };
    });
    const heroBg = hero ? getComputedStyle(hero).backgroundImage : null;
    const compactBorder = compact ? getComputedStyle(compact).borderColor : null;
    const badgeBg = badge ? getComputedStyle(badge).backgroundImage || getComputedStyle(badge).backgroundColor : null;
    const badgeColor = badge ? getComputedStyle(badge).color : null;
    return {
      kind,
      prefix: (prefix?.textContent || '').trim(),
      detailSample: (detail?.textContent || text?.textContent || '').trim().slice(0, 80),
      heroBg,
      compactBorder,
      badgeBg,
      badgeColor,
      legend,
    };
  }, kind);
}

async function shotHero(page, name) {
  const hero = page.locator('.bp-hero-zone');
  await hero.screenshot({ path: `${OUT}/${name}` });
}

async function shotLegend(page, name) {
  const legend = page.locator('.bp-cal-legend');
  if (await legend.count()) {
    await legend.screenshot({ path: `${OUT}/${name}` });
  }
}

// PC home
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}?id=cw&shell=v2&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  await shotHero(page, 'home-hero-pc.png');
  await shotLegend(page, 'calendar-legend-pc.png');
  await page.screenshot({ path: `${OUT}/home-full-pc.png`, fullPage: false });
  report.shots['pc'] = await measure(page, 'pc');
  await ctx.close();
}

// Mobile home
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}?id=cw&shell=v2&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  await shotHero(page, 'home-hero-mobile.png');
  await shotLegend(page, 'calendar-legend-mobile.png');
  await page.screenshot({ path: `${OUT}/home-full-mobile.png`, fullPage: false });
  report.shots['mobile'] = await measure(page, 'mobile');
  await ctx.close();
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
