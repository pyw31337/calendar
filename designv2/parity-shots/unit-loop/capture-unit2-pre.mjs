import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'https://pyw31337.github.io/calendar';
const OUT = 'designv2/parity-shots/unit-loop/unit2';
fs.mkdirSync(OUT, { recursive: true });

const screens = [
  { id: 'content-v2', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=content` },
  { id: 'archive-v2', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=archive` },
  { id: 'content-default', url: `${BASE}/?id=cw&tab=records&sub=content` },
  { id: 'archive-default', url: `${BASE}/?id=cw&tab=records&sub=archive` },
  { id: 'places-v2', url: `${BASE}/?id=cw&shell=v2&tab=places` },
  { id: 'gallery-v2', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=media` },
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
const report = { base: BASE, phase: 'pre', capturedAt: new Date().toISOString() };

async function measure(page, kind) {
  return page.evaluate((kind) => {
    const qs = (s) => document.querySelector(s);
    const qsa = (s) => [...document.querySelectorAll(s)];
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    };
    const cs = (el) => el ? getComputedStyle(el) : null;
    const pick = (el, props) => {
      if (!el) return null;
      const s = cs(el);
      const o = { tag: el.tagName, class: (el.className || '').toString().slice(0, 120), text: (el.innerText || '').replace(/\s+/g,' ').trim().slice(0, 60) };
      for (const p of props) o[p] = s[p];
      o.rect = rect(el);
      return o;
    };

    const header = qs('.v2-page-header, .bp-header, .places-view-header, .gallery-page-header');
    const headerActions = qsa('.v2-page-header .bp-header-actions button, .v2-page-header .bp-icon-btn, .places-view-header button, .gallery-page-header button');
    const chips = qsa('[class*="category-chip"], .bp-cat-chip, .underline-tabs button, [class*="chip"], .culture-filter-chip, .content-category-chip, button[class*="filter"]');
    const chipRow = qs('[class*="category"], .underline-tabs, .bp-cat-row, .culture-category-row, .places-category-sticky-tabs');
    const grids = qsa('.culture-items-grid, .history-bento-grid, [class*="items-grid"], [class*="bento-grid"], .gallery-page-scroll div[style*="grid"]');
    const cards = qsa('.content-card, [class*="culture-card"], .history-card, [class*="memory-card"], .culture-items-grid > *, .history-bento-grid > *');
    const legacyTitle = qs('.v2-has-page-header .places-view-header, .v2-has-page-header .gallery-page-header');
    const pagePadCandidates = qsa('.culture-items-grid, .history-bento-grid, .places-list-body, .v2-content, .v2-archive, .v2-content-legacy, .v2-archive-legacy');

    const gridInfo = grids.map(g => {
      const s = cs(g);
      return {
        class: (g.className || '').toString().slice(0, 80),
        gtc: s.gridTemplateColumns,
        gap: s.gap || s.rowGap,
        padding: s.padding,
        cols: (s.gridTemplateColumns || '').split(' ').filter(Boolean).length,
        childCount: g.children.length,
        rect: rect(g),
      };
    });

    const chipInfo = chips.slice(0, 20).map(c => {
      const s = cs(c);
      return {
        text: (c.innerText || c.getAttribute('aria-label') || '').replace(/\s+/g,' ').trim().slice(0, 40),
        class: (c.className || '').toString().slice(0, 80),
        display: s.display,
        padding: s.padding,
        fontSize: s.fontSize,
        height: s.height,
        borderRadius: s.borderRadius,
        margin: s.margin,
        rect: rect(c),
        visible: s.display !== 'none' && rect(c)?.w > 0,
      };
    });

    const cardInfo = cards.slice(0, 8).map(c => {
      const s = cs(c);
      return {
        class: (c.className || '').toString().slice(0, 80),
        borderRadius: s.borderRadius,
        padding: s.padding,
        border: s.border,
        boxShadow: s.boxShadow,
        margin: s.margin,
        rect: rect(c),
      };
    });

    const h = header ? pick(header, ['padding', 'height', 'borderBottom', 'backgroundColor', 'gap']) : null;
    const actions = headerActions.map(b => ({
      aria: b.getAttribute('aria-label'),
      text: (b.innerText || '').replace(/\s+/g,' ').trim().slice(0, 30),
      class: (b.className || '').toString().slice(0, 60),
      rect: rect(b),
      display: cs(b).display,
      padding: cs(b).padding,
    }));

    // DOM dump of key structure near content
    const root = qs('.v2-content, .v2-archive, .v2-content-legacy, .v2-archive-legacy, .places-view-container, .history-page, #root');
    const structure = [];
    function walk(el, depth) {
      if (!el || depth > 4) return;
      const kids = [...el.children].slice(0, 12);
      for (const k of kids) {
        structure.push({
          depth,
          tag: k.tagName,
          class: (k.className || '').toString().slice(0, 100),
          id: k.id || '',
          text: (k.innerText || '').replace(/\s+/g,' ').trim().slice(0, 40),
          rect: rect(k),
        });
        if (depth < 3) walk(k, depth + 1);
      }
    }
    if (root) walk(root, 0);

    return {
      kind,
      title: document.title,
      v2: !!qs('.v2-design'),
      headerText: (header?.innerText || '').replace(/\s+/g,' ').trim().slice(0, 100),
      header: h,
      headerActions: actions,
      legacyTitleHidden: legacyTitle ? cs(legacyTitle).display === 'none' : null,
      chipCount: chips.length,
      chipsVisible: chipInfo.filter(c => c.visible).length,
      chips: chipInfo,
      chipRow: chipRow ? pick(chipRow, ['padding', 'gap', 'display', 'flexWrap', 'borderBottom', 'backgroundColor']) : null,
      grids: gridInfo,
      cards: cardInfo,
      pagePads: pagePadCandidates.slice(0, 6).map(el => pick(el, ['padding', 'margin', 'gap', 'display'])),
      bodyScrollPad: pick(qs('.v2-records-body, .places-view-body, .history-scroll'), ['padding', 'overflow']),
      structure: structure.slice(0, 40),
    };
  }, kind);
}

for (const s of screens) {
  console.log('goto', s.url);
  await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
  const info = await measure(page, s.id);
  report[s.id] = info;
  await page.screenshot({ path: `${OUT}/${s.id}-pre.png`, fullPage: false });
  console.log(s.id, 'chips', info.chipsVisible, 'grids', info.grids?.length, 'actions', info.headerActions?.length);
}

fs.writeFileSync(`${OUT}/pre-report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log('done pre');
