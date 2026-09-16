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
const report = { base: BASE, phase: 'post', mergeSha: '7841c153', capturedAt: new Date().toISOString() };

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
    const rows = qsa('.msg-row-hover').slice(0, 4);
    const bubbles = rows.map((row) => {
      const candidates = [...row.querySelectorAll('div')].filter((d) => {
        const s = getComputedStyle(d);
        return d.innerText?.trim()?.length > 0 && (parseFloat(s.paddingTop) >= 6);
      });
      const b = candidates.find((d) => d.getBoundingClientRect().height > 20) || candidates[0];
      const s = b ? getComputedStyle(b) : null;
      return {
        rowMarginBottom: cs(row)?.marginBottom,
        bubblePadding: s?.padding,
        bubbleFont: s?.fontSize,
        bubbleRadius: s?.borderRadius,
      };
    });
    const scroll = qs('.chat-messages-scroll, .v2-chat-scroll');
    const composer = qs('.chat-composer, .v2-chat-composer');
    const textarea = composer?.querySelector('textarea.bp-composer-input, .v2-chat-compose-row textarea, textarea');
    const tools = qs('.v2-chat-compose-tools');
    const toolBtn = qs('.v2-tool-icon-btn');
    return {
      v2: !!qs('.v2-design'),
      header: (qs('.v2-page-header, .bp-header')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      scrollPadding: scroll ? cs(scroll).padding : null,
      composerPadding: composer ? cs(composer).padding : null,
      composerHeight: composer ? rect(composer)?.h : null,
      textareaPadding: textarea ? cs(textarea).padding : null,
      textareaFont: textarea ? cs(textarea).fontSize : null,
      textareaHeight: textarea ? rect(textarea)?.h : null,
      toolsPadding: tools ? cs(tools).padding : null,
      toolBtnSize: toolBtn ? { w: rect(toolBtn)?.w, h: rect(toolBtn)?.h } : null,
      bubbles,
      features: {
        send: !!qs('.bp-composer-send, button[aria-label="메시지 전송"]'),
        attach: !!qs('button[aria-label*="첨부"], .v2-chat-compose-row button'),
        tools: !!tools,
        search: !!qs('.v2-page-header button[aria-label*="검색"]'),
      },
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
    const searchBox = qs('.v2-memo .bp-search-row, .v2-memo .bp-search-input')?.closest('.bp-search-row') || qs('.v2-memo .bp-search-input');
    const cardEls = qsa('.memo-card-hover').slice(0, 3);
    let searchToComposer = null;
    if (searchBox && composer) {
      searchToComposer = +(composer.getBoundingClientRect().top - searchBox.getBoundingClientRect().bottom).toFixed(1);
    }
    let composerToFirst = null;
    if (composer && list) {
      const after = [...list.children].find((c) => c !== composer && c.getBoundingClientRect().top > composer.getBoundingClientRect().bottom - 2);
      if (after) composerToFirst = +(after.getBoundingClientRect().top - composer.getBoundingClientRect().bottom).toFixed(1);
    }
    return {
      v2: !!qs('.v2-design'),
      header: (qs('.v2-page-header, .bp-header')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      listPadding: list ? cs(list).padding : null,
      listGap: list ? cs(list).gap || cs(list).rowGap : null,
      composerPadding: composer ? cs(composer).padding : null,
      composerHeight: composer ? rect(composer)?.h : null,
      searchToComposer,
      composerToFirst,
      cards: cardEls.map((c) => ({
        padding: cs(c).padding,
        borderRadius: cs(c).borderRadius,
        borderLeft: cs(c).borderLeft,
      })),
      tagChipCount: qsa('.bp-tag-filter-row button, .tag-filter-row button').length,
      fab: (() => {
        const f = qs('.bp-fab, button[aria-label="메모 작성"]');
        return f ? { aria: f.getAttribute('aria-label'), visible: cs(f).display !== 'none' && rect(f).h > 0 } : null;
      })(),
      searchVisible: !!qs('.v2-memo .bp-search-input, .v2-memo input[type="search"]'),
    };
  });
}

// Bust CDN cache a bit
await page.goto(`${BASE}/?id=cw&shell=v2&_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(2000);

for (const s of screens) {
  console.log('goto', s.url);
  await page.goto(`${s.url}${s.url.includes('?') ? '&' : '?'}_=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
  if (s.id === 'chat') report.chat = await measureChat(page);
  else if (s.id === 'memo') report.memo = await measureMemo(page);
  else report.home = { v2: await page.evaluate(() => !!document.querySelector('.v2-design')) };
  await page.screenshot({ path: `${OUT}/${s.id}.png`, fullPage: false });
  console.log(s.id, JSON.stringify(report[s.id], null, 2).slice(0, 1400));
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log('done post');
