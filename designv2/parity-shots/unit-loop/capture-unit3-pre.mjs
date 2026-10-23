import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'https://pyw31337.github.io/calendar';
const OUT = 'designv2/parity-shots/unit-loop/unit3';
fs.mkdirSync(OUT, { recursive: true });

const screens = [
  { id: 'chat', url: `${BASE}/?id=cw&shell=v2&tab=chat` },
  { id: 'memo', url: `${BASE}/?id=cw&shell=v2&tab=memo` },
  { id: 'home', url: `${BASE}/?id=cw&shell=v2` },
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

async function measureChat(page) {
  return page.evaluate(() => {
    const qs = (s) => document.querySelector(s);
    const qsa = (s) => [...document.querySelectorAll(s)];
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    };
    const rows = qsa('.msg-row-hover').slice(0, 6);
    const bubbles = rows.map((row) => {
      const bubble = row.querySelector('div[style*="background"], div > div');
      const candidates = [...row.querySelectorAll('div')].filter((d) => {
        const s = getComputedStyle(d);
        return (s.backgroundColor.includes('255') || s.borderWidth !== '0px') && d.innerText?.trim()?.length > 0;
      });
      const b = candidates.find((d) => d.getBoundingClientRect().height > 20) || candidates[0];
      const s = b ? getComputedStyle(b) : null;
      return {
        rowMarginBottom: cs(row)?.marginBottom,
        rowGap: cs(row)?.gap || cs(row)?.rowGap,
        rowRect: rect(row),
        bubblePadding: s?.padding,
        bubbleFont: s?.fontSize,
        bubbleRadius: s?.borderRadius,
        bubbleRect: rect(b),
      };
    });
    const scroll = qs('.chat-messages-scroll, .v2-chat-scroll');
    const composer = qs('.chat-composer, .v2-chat-composer');
    const textarea = composer?.querySelector('textarea, input');
    const tools = qs('.v2-chat-compose-tools, .chat-compose-tools');
    return {
      v2: !!qs('.v2-design'),
      header: (qs('.v2-page-header, .bp-header')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      scrollPadding: scroll ? cs(scroll).padding : null,
      scrollRect: rect(scroll),
      composerPadding: composer ? cs(composer).padding : null,
      composerHeight: composer ? rect(composer)?.h : null,
      composerRect: rect(composer),
      textareaPadding: textarea ? cs(textarea).padding : null,
      textareaFont: textarea ? cs(textarea).fontSize : null,
      toolsPadding: tools ? cs(tools).padding : null,
      toolsHeight: tools ? rect(tools)?.h : null,
      rowCount: qsa('.msg-row-hover').length,
      bubbles,
      composerY: composer ? +composer.getBoundingClientRect().y.toFixed(1) : null,
      scrollY: scroll ? +scroll.getBoundingClientRect().y.toFixed(1) : null,
    };
  });
}

async function measureMemo(page) {
  return page.evaluate(() => {
    const qs = (s) => document.querySelector(s);
    const qsa = (s) => [...document.querySelectorAll(s)];
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    };
    const list = qs('.memo-list-scroll');
    const composer = qs('.memo-composer-card');
    const search = qs('.inline-search-bar, .bp-search-row, input[placeholder*="메모"]')?.closest('.inline-search-bar, .bp-search-row') || qs('input[placeholder*="메모"]');
    const cards = qsa('.memo-card-hover, [class*="memo-card"]').filter((el) => el.className?.toString?.().includes('memo') || el.classList.contains('memo-card-hover')).slice(0, 4);
    // Prefer memo-card-hover
    const cardEls = qsa('.memo-card-hover').slice(0, 4);
    const sectionLabels = qsa('.memo-list-scroll *').filter((el) => {
      const t = (el.textContent || '').trim();
      return el.children.length === 0 && (t === '최근 활동' || t === '메모 목록' || t === '고정됨');
    }).slice(0, 5).map((el) => ({ text: el.textContent.trim(), font: cs(el).fontSize, margin: cs(el).margin, rect: rect(el) }));

    const searchEl = qs('.v2-memo .inline-search-bar') || qs('input[placeholder*="메모"]');
    const searchBox = searchEl?.closest('.inline-search-bar') || searchEl;
    let searchToComposer = null;
    if (searchBox && composer) {
      searchToComposer = +(composer.getBoundingClientRect().top - searchBox.getBoundingClientRect().bottom).toFixed(1);
    }
    let composerToFirst = null;
    const firstCard = cardEls[0] || qs('.memo-list-scroll [class*="memo"]');
    // first section after composer
    if (composer) {
      const after = [...(list?.children || [])].find((c) => c !== composer && c.getBoundingClientRect().top > composer.getBoundingClientRect().bottom - 2);
      if (after) composerToFirst = +(after.getBoundingClientRect().top - composer.getBoundingClientRect().bottom).toFixed(1);
    }
    return {
      v2: !!qs('.v2-design'),
      header: (qs('.v2-page-header, .bp-header')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      listPadding: list ? cs(list).padding : null,
      listGap: list ? cs(list).gap || cs(list).rowGap : null,
      listRect: rect(list),
      composerPadding: composer ? cs(composer).padding : null,
      composerGap: composer ? cs(composer).gap : null,
      composerHeight: composer ? rect(composer)?.h : null,
      composerRect: rect(composer),
      searchToComposer,
      composerToFirst,
      sectionLabels,
      cards: cardEls.map((c) => ({
        padding: cs(c).padding,
        margin: cs(c).margin,
        borderRadius: cs(c).borderRadius,
        rect: rect(c),
        class: (c.className || '').toString().slice(0, 60),
      })),
      tagChipCount: qsa('.bp-tag-filter-row button, .tag-filter-row button, .bp-tag-chip').length,
      fab: (() => {
        const f = qs('.bp-fab, button[aria-label="메모 작성"]');
        return f ? { aria: f.getAttribute('aria-label'), rect: rect(f), display: cs(f).display } : null;
      })(),
    };
  });
}

for (const s of screens) {
  console.log('goto', s.url);
  await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
  if (s.id === 'chat') report.chat = await measureChat(page);
  else if (s.id === 'memo') report.memo = await measureMemo(page);
  else report.home = { v2: await page.evaluate(() => !!document.querySelector('.v2-design')) };
  await page.screenshot({ path: `${OUT}/${s.id}-pre.png`, fullPage: false });
  console.log(s.id, JSON.stringify(report[s.id], null, 2).slice(0, 1200));
}

fs.writeFileSync(`${OUT}/pre-report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log('done pre');
