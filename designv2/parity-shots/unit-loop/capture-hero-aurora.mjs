import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'http://127.0.0.1:5189/';
const OUT = 'designv2/parity-shots/unit-loop/hero-aurora';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { base: BASE, capturedAt: new Date().toISOString(), shots: {} };

async function waitReady(page) {
  await page.waitForSelector('.v2-design .bp-hero-zone', { timeout: 60000 });
  await page.waitForTimeout(4000);
}

async function measure(page, kind) {
  return page.evaluate((kind) => {
    const qs = (s) => document.querySelector(s);
    const hero = qs('.bp-hero-zone');
    const aurora = qs('.bp-hero-aurora');
    const before = hero ? getComputedStyle(hero, '::before') : null;
    const after = hero ? getComputedStyle(hero, '::after') : null;
    const auroraCs = aurora ? getComputedStyle(aurora) : null;
    const compact = qs('.bp-dday-compact');
    const prefix = qs('.bp-dday-compact-prefix');
    const title = qs('.bp-hero-zone .bp-bento-title, .bp-hero-zone .bp-brand-name');
    return {
      kind,
      hasAuroraSpan: !!aurora,
      heroBg: hero ? getComputedStyle(hero).backgroundImage : null,
      beforeAnim: before?.animationName || null,
      afterAnim: after?.animationName || null,
      auroraAnim: auroraCs?.animationName || null,
      beforeContent: before?.content || null,
      prefix: (prefix?.textContent || '').trim(),
      titleColor: title ? getComputedStyle(title).color : null,
      compactColor: compact ? getComputedStyle(compact).color : null,
    };
  }, kind);
}

async function shotHero(page, name) {
  await page.locator('.bp-hero-zone').screenshot({ path: `${OUT}/${name}` });
}

// PC
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}?id=cw&shell=v2&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  await shotHero(page, 'home-hero-pc.png');
  await page.screenshot({ path: `${OUT}/home-full-pc.png`, fullPage: false });
  report.shots.pc = await measure(page, 'pc');
  await ctx.close();
}

// Mobile
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
  await page.screenshot({ path: `${OUT}/home-full-mobile.png`, fullPage: false });
  report.shots.mobile = await measure(page, 'mobile');
  await ctx.close();
}

// Reduced motion (PC)
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}?id=cw&shell=v2&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  await shotHero(page, 'home-hero-pc-reduced-motion.png');
  report.shots.reducedMotion = await measure(page, 'reducedMotion');
  await ctx.close();
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
