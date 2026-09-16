import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'https://pyw31337.github.io/calendar';
const OUT = 'designv2/parity-shots/unit-loop/unit1';
fs.mkdirSync(OUT, { recursive: true });

const screens = [
  { id: 'home', url: `${BASE}/?id=cw&shell=v2` },
  { id: 'chat', url: `${BASE}/?id=cw&shell=v2&tab=chat` },
  { id: 'memo', url: `${BASE}/?id=cw&shell=v2&tab=memo` },
  { id: 'gallery', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=media` },
  { id: 'places', url: `${BASE}/?id=cw&shell=v2&tab=places` },
  { id: 'settlement', url: `${BASE}/?id=cw&shell=v2&tab=settlement` },
  { id: 'content', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=content` },
];

const browser = await chromium.launch({ headless: true });
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await mobile.newPage();
const report = { base: BASE, capturedAt: new Date().toISOString() };

async function measure(page) {
  return page.evaluate(() => {
    const tags = document.querySelectorAll('.bp-tag-filter-row .bp-tag-chip, .bp-tag-filter-row button');
    const tagRow = document.querySelector('.bp-tag-filter-row');
    const addBtn = document.querySelector('button[aria-label="장소 추가"]');
    const addCs = addBtn ? getComputedStyle(addBtn) : null;
    const addRect = addBtn?.getBoundingClientRect();
    const fab = document.querySelector('.bp-fab');
    const fabRect = fab?.getBoundingClientRect();
    const editBtn = document.querySelector('button[aria-label="편집"]');
    const rail = document.querySelector('.bp-side-nav');
    const annLabels = [...document.querySelectorAll('.bp-day-anniversary-label')];
    const annVisibleCss = annLabels.filter(el => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && parseFloat(cs.opacity || '1') > 0 && cs.visibility !== 'hidden';
    }).length;
    let galleryCols = null;
    const grid = document.querySelector('.gallery-page-scroll div[style*="grid"]');
    if (grid) {
      const gtc = getComputedStyle(grid).gridTemplateColumns;
      galleryCols = gtc ? gtc.split(' ').filter(Boolean).length : null;
    }
    return {
      tagChipCount: tags.length,
      tagRowExists: !!tagRow,
      placesAddExists: !!addBtn,
      placesAddDisplay: addCs?.display || null,
      placesAddVisible: !!(addBtn && addRect && addRect.width > 0 && addCs?.display !== 'none'),
      placesFabVisible: !!(fab && fabRect && fabRect.width > 0),
      placesFabAria: fab?.getAttribute('aria-label') || null,
      placesEditVisible: !!(editBtn && editBtn.getBoundingClientRect().width > 0),
      galleryCols,
      annLabelDom: annLabels.length,
      annLabelVisibleCss: annVisibleCss,
      header: (document.querySelector('.v2-page-header, .bp-header')?.innerText || '').replace(/\s+/g,' ').trim().slice(0,80),
      v2: !!document.querySelector('.v2-design'),
      railOpen: rail?.classList.contains('bp-is-open') || false,
    };
  });
}

for (const s of screens) {
  console.log('goto', s.url);
  await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
  const info = await measure(page);
  report[s.id] = info;
  await page.screenshot({ path: `${OUT}/${s.id}.png`, fullPage: false });
  console.log(s.id, JSON.stringify(info));
}

await page.goto(`${BASE}/?id=cw&shell=v2&tab=memo`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4500);
await page.evaluate(() => {
  const btn = document.querySelector('.v2-page-header button[aria-label*="메뉴"]');
  if (btn) btn.click();
});
await page.waitForTimeout(800);
report['side-nav-from-memo'] = await page.evaluate(() => {
  const rail = document.querySelector('.bp-side-nav');
  return {
    hasOpenClass: rail?.classList.contains('bp-is-open') || false,
    brand: (document.querySelector('.bp-side-nav-brand')?.innerText || '').replace(/\s+/g,' ').trim(),
  };
});
await page.screenshot({ path: `${OUT}/side-nav-from-memo.png`, fullPage: false });
console.log('side-nav', JSON.stringify(report['side-nav-from-memo']));
await mobile.close();

const pc = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const pcPage = await pc.newPage();
await pcPage.goto(`${BASE}/?id=cw&shell=v2`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await pcPage.waitForTimeout(5000);
report['home-pc'] = await pcPage.evaluate(() => {
  const annLabels = [...document.querySelectorAll('.bp-day-anniversary-label')];
  const annVisibleCss = annLabels.filter(el => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && parseFloat(cs.opacity || '1') > 0 && cs.visibility !== 'hidden';
  }).length;
  return { annLabelDom: annLabels.length, annLabelVisibleCss: annVisibleCss };
});
await pcPage.screenshot({ path: `${OUT}/home-pc.png`, fullPage: false });
await pc.close();

report.unit1 = {
  placesToolbarAddHidden: report.places?.placesAddVisible === false,
  placesFabPresent: report.places?.placesFabVisible === true,
  placesEditKept: report.places?.placesEditVisible === true,
  memoNoTagCloud: report.memo?.tagChipCount === 0,
  gallery4col: report.gallery?.galleryCols === 4,
  annivMobileHidden: report.home?.annLabelVisibleCss === 0,
  annivPcVisible: report['home-pc']?.annLabelVisibleCss > 0,
  sideNavFromMemo: !!report['side-nav-from-memo']?.hasOpenClass,
};

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log('UNIT1', JSON.stringify(report.unit1, null, 2));
console.log('done');
