import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'https://pyw31337.github.io/calendar';
const OUT = 'designv2/parity-shots/unit-loop/unit0';
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
const report = { base: BASE, capturedAt: new Date().toISOString(), gates: {} };

async function measure(page) {
  return page.evaluate(() => {
    const tags = document.querySelectorAll('.bp-tag-filter-row .bp-tag-chip, .bp-tag-filter-row button');
    const tagRow = document.querySelector('.bp-tag-filter-row');
    const sortBtn = document.querySelector('button[aria-label="정렬"]');
    const menuBtn = document.querySelector('.v2-page-header button[aria-label*="메뉴"], .bp-header-actions button[aria-label*="메뉴"]');
    const rail = document.querySelector('.bp-side-nav');
    const annLabels = [...document.querySelectorAll('.bp-day-anniversary-label')];
    const annVisible = annLabels.filter(el => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0' && el.offsetParent !== null;
    }).length;
    const annVisibleAlt = annLabels.filter(el => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && parseFloat(cs.opacity || '1') > 0 && cs.visibility !== 'hidden';
    }).length;
    // gallery columns — try several selectors
    let cols = null;
    const candidates = [
      '.gallery-page-scroll div[style*="grid"]',
      '.v2-design [style*="grid-template-columns"]',
      '.media-grid',
      '.gallery-grid',
      '[class*="gallery"] [style*="grid"]',
    ];
    for (const sel of candidates) {
      const grid = document.querySelector(sel);
      if (!grid) continue;
      const gtc = getComputedStyle(grid).gridTemplateColumns;
      if (gtc && gtc !== 'none') {
        cols = gtc.split(' ').filter(Boolean).length;
        break;
      }
    }
    // also count visible thumb cells in first row
    const thumbs = [...document.querySelectorAll('.gallery-page-scroll img, .media-item, [class*="gallery"] img')].slice(0, 20);
    return {
      tagChipCount: tags.length,
      tagRowDisplay: tagRow ? getComputedStyle(tagRow).display : null,
      tagRowExists: !!tagRow,
      hasSort: !!sortBtn,
      hasMenu: !!menuBtn,
      railOpen: rail?.classList.contains('bp-is-open') || false,
      railDisplay: rail ? getComputedStyle(rail).display : null,
      annLabelDom: annLabels.length,
      annLabelVisible: annVisible,
      annLabelVisibleCss: annVisibleAlt,
      galleryCols: cols,
      header: (document.querySelector('.v2-page-header, .bp-header')?.innerText || '').replace(/\s+/g,' ').trim().slice(0,100),
      v2: !!document.querySelector('.v2-design'),
      painNotes: [],
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

// side-nav from memo hamburger
await page.goto(`${BASE}/?id=cw&shell=v2&tab=memo`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4500);
const opened = await page.evaluate(() => {
  const btn = document.querySelector('.v2-page-header button[aria-label*="메뉴"], .bp-header-actions button[aria-label*="메뉴"]');
  if (btn) { btn.click(); return { ok: true, label: btn.getAttribute('aria-label') }; }
  // fallback: last header action
  const acts = document.querySelectorAll('.v2-page-header .bp-header-actions button, .bp-header-actions button');
  if (acts.length) { acts[acts.length - 1].click(); return { ok: true, label: 'fallback-last' }; }
  return { ok: false };
});
await page.waitForTimeout(800);
const drawer = await page.evaluate(() => {
  const rail = document.querySelector('.bp-side-nav');
  const cs = rail ? getComputedStyle(rail) : null;
  return {
    hasOpenClass: rail?.classList.contains('bp-is-open') || false,
    transform: cs?.transform || null,
    visibility: cs?.visibility || null,
    brand: (document.querySelector('.bp-side-nav-brand')?.innerText || '').replace(/\s+/g,' ').trim(),
    visibleText: (rail?.innerText || '').replace(/\s+/g,' ').trim().slice(0, 120),
  };
});
report['side-nav-from-memo'] = { opened, ...drawer };
await page.screenshot({ path: `${OUT}/side-nav-from-memo.png`, fullPage: false });
console.log('side-nav', JSON.stringify(report['side-nav-from-memo']));

await mobile.close();

// PC-width home for anniversary labels
const pc = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});
const pcPage = await pc.newPage();
await pcPage.goto(`${BASE}/?id=cw&shell=v2`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await pcPage.waitForTimeout(5000);
await pcPage.keyboard.press('Escape').catch(() => {});
const pcInfo = await pcPage.evaluate(() => {
  const annLabels = [...document.querySelectorAll('.bp-day-anniversary-label')];
  const annVisible = annLabels.filter(el => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && parseFloat(cs.opacity || '1') > 0 && cs.visibility !== 'hidden';
  }).length;
  const sample = annLabels.slice(0, 5).map(el => {
    const cs = getComputedStyle(el);
    return { text: (el.innerText||'').trim().slice(0,40), display: cs.display, opacity: cs.opacity, visibility: cs.visibility };
  });
  return { annLabelDom: annLabels.length, annLabelVisibleCss: annVisible, sample, v2: !!document.querySelector('.v2-design') };
});
report['home-pc'] = pcInfo;
await pcPage.screenshot({ path: `${OUT}/home-pc.png`, fullPage: false });
console.log('home-pc', JSON.stringify(pcInfo));
await pc.close();

// Gate summary
report.gates = {
  memoNoTagCloud: report.memo?.tagChipCount === 0 && report.memo?.tagRowExists !== true,
  hamburgerOpensSideNav: !!(report['side-nav-from-memo']?.hasOpenClass || report['side-nav-from-memo']?.brand),
  galleryApprox4Cols: report.gallery?.galleryCols === 4,
  annivHiddenMobile: (report.home?.annLabelVisibleCss ?? 1) === 0,
  annivVisiblePc: (report['home-pc']?.annLabelVisibleCss ?? 0) > 0,
};

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log('GATES', JSON.stringify(report.gates, null, 2));
console.log('done');
