import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'https://pyw31337.github.io/calendar';
const OUT = 'designv2/parity-shots/unit-loop/unit2';
fs.mkdirSync(OUT, { recursive: true });

const screens = [
  { id: 'content', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=content` },
  { id: 'archive', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=archive` },
  { id: 'home', url: `${BASE}/?id=cw&shell=v2` },
  { id: 'memo', url: `${BASE}/?id=cw&shell=v2&tab=memo` },
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
const report = { base: BASE, phase: 'post', mergeSha: 'bb722a4e', capturedAt: new Date().toISOString() };

async function measure(page, kind) {
  return page.evaluate((kind) => {
    const qs = (s) => document.querySelector(s);
    const qsa = (s) => [...document.querySelectorAll(s)];
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    };
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const header = qs('.v2-page-header, .bp-header');
    const v2Search = qsa('.v2-page-header .bp-icon-btn').map((b) => ({
      aria: b.getAttribute('aria-label'),
      rect: rect(b),
      display: cs(b).display,
    }));
    const grids = qsa('.culture-items-grid, .history-bento-grid').map((g) => {
      const s = cs(g);
      return { class: (g.className || '').toString().slice(0, 80), gap: s.gap || s.rowGap, padding: s.padding, cols: (s.gridTemplateColumns || '').split(' ').filter(Boolean).length, childCount: g.children.length, rect: rect(g) };
    });
    const toolbar = qs('.region-filter-trigger-row');
    const tabs = qs('.underline-tabs');
    const chipRow = qs('.history-header-stack > div:not([class])');
    const chipBtn = chipRow?.querySelector('button');
    return {
      kind,
      v2: !!qs('.v2-design'),
      headerText: (header?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      v2HeaderActions: v2Search,
      legacySearchHidden: (() => {
        const b = qs('.places-view-header button[aria-label*="검색"]');
        if (!b) return null;
        const p = b.closest('.places-view-header');
        return { aria: b.getAttribute('aria-label'), parentDisplay: p ? cs(p).display : null, btnRect: rect(b) };
      })(),
      grids,
      toolbar: toolbar ? { padding: cs(toolbar).padding, gap: cs(toolbar).gap, height: cs(toolbar).height, rect: rect(toolbar) } : null,
      tabs: tabs ? { padding: cs(tabs).padding, fontSize: cs(tabs.querySelector('button'))?.fontSize, rect: rect(tabs) } : null,
      chips: chipRow ? { rowPadding: cs(chipRow).padding, gap: cs(chipRow).gap, btnPadding: chipBtn ? cs(chipBtn).padding : null, btnFont: chipBtn ? cs(chipBtn).fontSize : null } : null,
    };
  }, kind);
}

async function probeSearch(page, kind, aria) {
  const before = await page.evaluate(() => !!document.querySelector('.inline-search-bar'));
  await page.locator(`.v2-page-header button[aria-label="${aria}"]`).click({ timeout: 5000 });
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => {
    const bar = document.querySelector('.inline-search-bar');
    if (!bar) return { open: false };
    const s = getComputedStyle(bar);
    const r = bar.getBoundingClientRect();
    return { open: s.display !== 'none' && r.height > 0, h: +r.height.toFixed(1), placeholder: bar.querySelector('input')?.placeholder || '' };
  });
  report[`${kind}-searchProbe`] = { before, after, aria };
  console.log(kind, 'searchProbe', JSON.stringify(report[`${kind}-searchProbe`]));
  // close if open
  const close = page.locator('.inline-search-bar button[aria-label*="닫기"], .inline-search-bar button[title*="닫"], .inline-search-bar button').first();
  if (await close.count()) await close.click().catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);
}

for (const s of screens) {
  console.log('goto', s.url);
  await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
  const info = await measure(page, s.id);
  report[s.id] = info;
  await page.screenshot({ path: `${OUT}/${s.id}.png`, fullPage: false });
  console.log(s.id, JSON.stringify({ actions: info.v2HeaderActions, grids: info.grids, toolbar: info.toolbar, chips: info.chips }));
  if (s.id === 'content') await probeSearch(page, 'content', '컨텐츠 검색');
  if (s.id === 'archive') await probeSearch(page, 'archive', '보관함 검색');
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log('done post');
