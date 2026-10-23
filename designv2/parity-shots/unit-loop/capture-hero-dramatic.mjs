import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'http://127.0.0.1:5190/';
const OUT = 'designv2/parity-shots/unit-loop/hero-dramatic';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { base: BASE, capturedAt: new Date().toISOString(), shots: {} };

async function waitReady(page) {
  await page.waitForSelector('.v2-design .bp-hero-zone', { timeout: 60000 });
  await page.waitForTimeout(1200);
}

async function measure(page, kind) {
  return page.evaluate((kind) => {
    const qs = (s) => document.querySelector(s);
    const hero = qs('.bp-hero-zone');
    const aurora = qs('.bp-hero-aurora');
    const heroCs = hero ? getComputedStyle(hero) : null;
    const before = hero ? getComputedStyle(hero, '::before') : null;
    const after = hero ? getComputedStyle(hero, '::after') : null;
    const auroraCs = aurora ? getComputedStyle(aurora) : null;
    const compact = qs('.bp-dday-compact');
    const prefix = qs('.bp-dday-compact-prefix');
    const title = qs('.bp-hero-zone .bp-bento-title, .bp-hero-zone .bp-brand-name');
    return {
      kind,
      hasAuroraSpan: !!aurora,
      heroBg: heroCs?.backgroundImage || null,
      heroBgSize: heroCs?.backgroundSize || null,
      heroAnim: heroCs?.animationName || null,
      heroAnimDuration: heroCs?.animationDuration || null,
      beforeContent: before?.content || null,
      beforeAnim: before?.animationName || null,
      beforeAnimDuration: before?.animationDuration || null,
      beforeBlend: before?.mixBlendMode || null,
      beforeTransform: before?.transform || null,
      afterAnim: after?.animationName || null,
      afterAnimDuration: after?.animationDuration || null,
      afterBlend: after?.mixBlendMode || null,
      afterTransform: after?.transform || null,
      auroraAnim: auroraCs?.animationName || null,
      auroraAnimDuration: auroraCs?.animationDuration || null,
      auroraTransform: auroraCs?.transform || null,
      prefix: (prefix?.textContent || '').trim(),
      titleColor: title ? getComputedStyle(title).color : null,
      compactColor: compact ? getComputedStyle(compact).color : null,
    };
  }, kind);
}

async function shotHero(page, name) {
  await page.locator('.bp-hero-zone').screenshot({ path: `${OUT}/${name}` });
}

async function captureFrames(page, prefix) {
  await shotHero(page, `${prefix}.png`);
  const t0 = await measure(page, `${prefix}-t0`);
  await page.waitForTimeout(3000);
  await shotHero(page, `${prefix}-t2.png`);
  const t2 = await measure(page, `${prefix}-t2`);
  return { t0, t2 };
}

// PC
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}?id=cw&shell=v2&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  report.shots.pc = await captureFrames(page, 'home-hero-pc');
  await page.screenshot({ path: `${OUT}/home-full-pc.png`, fullPage: false });
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
  report.shots.mobile = await captureFrames(page, 'home-hero-mobile');
  await page.screenshot({ path: `${OUT}/home-full-mobile.png`, fullPage: false });
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
