import { chromium } from 'playwright';
const BASE = 'https://pyw31337.github.io/calendar';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
  isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await ctx.newPage();

async function audit(tab, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4500);
  await page.keyboard.press('Escape').catch(() => {});
  const info = await page.evaluate(() => {
    const fabs = [...document.querySelectorAll('.bp-fab, .fab, button.fab, [class*="Fab"], [class*="fab"]')].map(el => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName, cls: el.className?.toString?.().slice(0,80),
        aria: el.getAttribute('aria-label'),
        display: cs.display, visibility: cs.visibility,
        w: Math.round(r.width), h: Math.round(r.height),
        bottom: Math.round(r.bottom), right: Math.round(window.innerWidth - r.right),
        visible: r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden',
      };
    });
    const plusBtns = [...document.querySelectorAll('button')].filter(b => {
      const t = (b.getAttribute('aria-label') || b.title || b.innerText || '').trim();
      const looksPlus = t === '+' || /추가|등록|새 |create|add/i.test(t) || (b.querySelector('svg') && /plus|add/i.test(b.innerHTML));
      const r = b.getBoundingClientRect();
      return looksPlus && r.width > 0 && r.height > 0;
    }).map(b => {
      const r = b.getBoundingClientRect();
      return { aria: b.getAttribute('aria-label'), text: (b.innerText||'').trim().slice(0,20), cls: b.className?.toString?.().slice(0,60), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    });
    const headerActs = [...document.querySelectorAll('.v2-page-header button, .bp-header-actions button')].map(b => ({
      aria: b.getAttribute('aria-label'), cls: b.className?.toString?.().slice(0,50),
    }));
    // double chrome: legacy titles
    const legacyTitles = [...document.querySelectorAll('h1,h2,.page-title,[class*="title"]')].slice(0,12).map(el => ({
      text: (el.innerText||'').replace(/\s+/g,' ').trim().slice(0,40),
      cls: el.className?.toString?.().slice(0,50),
      visible: el.offsetParent !== null && getComputedStyle(el).display !== 'none',
    }));
    // content: hamburger present?
    const menu = document.querySelector('.v2-page-header button[aria-label*="메뉴"]');
    const menuRect = menu?.getBoundingClientRect();
    return {
      fabs: fabs.filter(f => f.visible),
      plusBtns,
      headerActs,
      menuVisible: !!(menu && menuRect && menuRect.width > 0),
      menuAria: menu?.getAttribute('aria-label'),
      legacyTitles: legacyTitles.filter(t => t.visible && t.text),
      bodyScroll: { scrollH: document.body.scrollHeight, clientH: document.documentElement.clientHeight },
    };
  });
  console.log('\n===', tab, '===');
  console.log(JSON.stringify(info, null, 2));
}

await audit('places', `${BASE}/?id=cw&shell=v2&tab=places`);
await audit('memo', `${BASE}/?id=cw&shell=v2&tab=memo`);
await audit('settlement', `${BASE}/?id=cw&shell=v2&tab=settlement`);
await audit('gallery', `${BASE}/?id=cw&shell=v2&tab=records&sub=media`);
await audit('content', `${BASE}/?id=cw&shell=v2&tab=records&sub=content`);
await audit('chat', `${BASE}/?id=cw&shell=v2&tab=chat`);
await browser.close();
