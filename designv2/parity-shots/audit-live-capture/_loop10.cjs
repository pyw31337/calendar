const { chromium } = require('playwright');
const fs = require('fs');
const out = 'designv2/parity-shots/audit-live-capture';
const screens = [
  { id: 'chat', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=chat', wait: 5500 },
  { id: 'settlement', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=settlement', wait: 4500 },
  { id: 'memo', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=memo', wait: 4500 },
  { id: 'gallery', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=media', wait: 5000 },
  { id: 'content', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=content', wait: 5000 },
  { id: 'archive', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=archive', wait: 4500 },
  { id: 'places', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=places', wait: 5000 },
  { id: 'home', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=calendar', wait: 4000 },
];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const report = {};
  for (const s of screens) {
    await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(s.wait);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
    const info = await page.evaluate(() => {
      const rail = document.querySelector('.bp-side-nav');
      const brand = document.querySelector('.bp-side-nav-brand, [class*="side-nav-brand"]');
      const brandText = (brand?.innerText || '').replace(/\s+/g, ' ').trim();
      const brandImg = brand?.querySelector('img');
      const heroBrand = document.querySelector('.bp-brand-name, .bp-bento-title-brand, [class*="brand-name"]');
      const main = document.querySelector('.renewal-shell-main');
      const shell = document.querySelector('.v2-dest-page > .bp-app-shell, .v2-chat-root, .v2-chat-shell');
      const header = document.querySelector('.v2-page-header');
      const scroll = document.querySelector('.v2-chat-scroll, .chat-messages-scroll, .v2-memo-body, .v2-settlement-body, .settlement-page-body, .gallery-page-scroll');
      const bubble = document.querySelector('.msg-row-hover > div > div[style*="background"], .msg-row-hover [class*="bubble"]');
      const ownPill = document.querySelector('.msg-row-own-with-pill > span');
      const r = el => el ? ({
        x: Math.round(el.getBoundingClientRect().x),
        y: Math.round(el.getBoundingClientRect().y),
        w: Math.round(el.getBoundingClientRect().width),
        h: Math.round(el.getBoundingClientRect().height),
        mw: getComputedStyle(el).maxWidth,
        ov: getComputedStyle(el).overflowY,
      }) : null;
      const docH = document.documentElement.scrollHeight;
      const bodyH = document.body.scrollHeight;
      return {
        railW: rail ? Math.round(rail.getBoundingClientRect().width) : 0,
        brandText,
        brandImg: brandImg ? brandImg.getAttribute('src') : null,
        heroBrand: (heroBrand?.innerText || '').replace(/\s+/g,' ').trim().slice(0,40),
        main: r(main),
        shell: r(shell),
        header: header ? (header.innerText||'').replace(/\s+/g,' ').trim().slice(0,60) : null,
        scroll: r(scroll),
        bubble: r(bubble),
        ownPill: ownPill ? (ownPill.innerText||'').trim().slice(0,20) : null,
        ownPillCount: document.querySelectorAll('.msg-row-own-with-pill').length,
        docScrollH: Math.max(docH, bodyH),
        mainOverflow: main ? getComputedStyle(main).overflowY : null,
        toolIcons: document.querySelectorAll('.v2-tool-icon-btn').length,
        picker: (() => {
          const p = document.querySelector('.participant-picker-button, .v2-chat-participant-missing');
          return p ? (p.innerText||'').replace(/\s+/g,' ').trim().slice(0,30) : null;
        })(),
      };
    });
    report[s.id] = info;
    await page.screenshot({ path: `${out}/loop10-${s.id}.png`, fullPage: false });
    console.log(s.id, JSON.stringify(info));
  }
  fs.writeFileSync(`${out}/loop10-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
