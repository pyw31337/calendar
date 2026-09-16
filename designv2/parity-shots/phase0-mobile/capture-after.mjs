import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:4173';
const OUT = 'designv2/parity-shots/phase0-mobile/v2-after';
const screens = [
  { id: 'chat', url: `${BASE}/?id=cw&shell=v2&tab=chat` },
  { id: 'memo', url: `${BASE}/?id=cw&shell=v2&tab=memo` },
  { id: 'gallery', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=media` },
  { id: 'places', url: `${BASE}/?id=cw&shell=v2&tab=places` },
  { id: 'settlement', url: `${BASE}/?id=cw&shell=v2&tab=settlement` },
  { id: 'content', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=content` },
  { id: 'home-anniv', url: `${BASE}/?id=cw&shell=v2&tab=calendar` },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();
const report = {};

for (const s of screens) {
  await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4500);
  await page.keyboard.press('Escape').catch(() => {});
  const info = await page.evaluate(() => {
    const tags = document.querySelectorAll('.bp-tag-filter-row .bp-tag-chip, .bp-tag-filter-row button');
    const tagRow = document.querySelector('.bp-tag-filter-row');
    const sortBtn = document.querySelector('button[aria-label="정렬"]');
    const menuBtn = document.querySelector('.v2-page-header button[aria-label*="메뉴"], .bp-header-actions button[aria-label*="메뉴"]');
    const rail = document.querySelector('.bp-side-nav');
    const annLabels = [...document.querySelectorAll('.bp-day-anniversary-label')];
    const annVisible = annLabels.filter(el => getComputedStyle(el).display !== 'none').length;
    const grid = document.querySelector('.gallery-page-scroll div[style*="grid"]');
    let cols = null;
    if (grid) {
      const gtc = getComputedStyle(grid).gridTemplateColumns;
      cols = gtc ? gtc.split(' ').filter(Boolean).length : null;
    }
    return {
      tagChipCount: tags.length,
      tagRowDisplay: tagRow ? getComputedStyle(tagRow).display : null,
      hasSort: !!sortBtn,
      hasMenu: !!menuBtn,
      railOpen: rail?.classList.contains('bp-is-open') || false,
      annLabelDom: annLabels.length,
      annLabelVisible: annVisible,
      galleryCols: cols,
      header: (document.querySelector('.v2-page-header, .bp-header')?.innerText || '').replace(/\s+/g,' ').trim().slice(0,80),
    };
  });
  report[s.id] = info;
  await page.screenshot({ path: `${OUT}/${s.id}.png`, fullPage: false });
  console.log(s.id, JSON.stringify(info));
}

// Open side-nav from memo hamburger
await page.goto(`${BASE}/?id=cw&shell=v2&tab=memo`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4000);
const opened = await page.evaluate(() => {
  const btn = document.querySelector('.v2-page-header button[aria-label*="메뉴"], .bp-header-actions button[aria-label*="메뉴"]');
  if (btn) { btn.click(); return true; }
  return false;
});
await page.waitForTimeout(700);
const drawer = await page.evaluate(() => {
  const rail = document.querySelector('.bp-side-nav');
  return {
    openedClick: true,
    hasOpenClass: rail?.classList.contains('bp-is-open') || false,
    transform: rail ? getComputedStyle(rail).transform : null,
    brand: (document.querySelector('.bp-side-nav-brand')?.innerText || '').replace(/\s+/g,' ').trim(),
  };
});
report['side-menu-from-memo'] = { opened, ...drawer };
await page.screenshot({ path: `${OUT}/side-menu-from-memo.png`, fullPage: false });
console.log('side-menu', JSON.stringify(report['side-menu-from-memo']));

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log('done');
