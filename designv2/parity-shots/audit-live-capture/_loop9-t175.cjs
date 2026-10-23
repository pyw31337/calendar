const { chromium } = require('playwright');
const fs = require('fs');
const out = 'designv2/parity-shots/audit-live-capture';
const screens = [
  { id: 'chat', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=chat', wait: 5000 },
  { id: 'settlement', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=settlement', wait: 4500 },
  { id: 'places', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=places', wait: 5000 },
  { id: 'memo', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=memo', wait: 4500 },
  { id: 'gallery', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=media', wait: 5000 },
  { id: 'content', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=content', wait: 5000 },
  { id: 'archive', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=archive', wait: 4500 },
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
    await page.waitForTimeout(300);
    const info = await page.evaluate(() => {
      const rail = document.querySelector('.bp-side-nav');
      const brand = document.querySelector('.bp-side-nav-brand, [class*="side-nav-brand"]');
      const brandText = (brand?.innerText || '').replace(/\s+/g, ' ').trim();
      const brandImg = brand?.querySelector('img');
      const heroBrand = document.querySelector('.bp-brand-name, .bp-bento-title-brand, [class*="brand-name"]');
      const main = document.querySelector('.renewal-shell-main, .v2-dest-page, .v2-chat-root');
      const shell = document.querySelector('.v2-dest-page > .bp-app-shell, .v2-chat-root, .v2-chat-shell');
      const header = document.querySelector('.v2-page-header');
      const legacyHeader = document.querySelector('.gallery-page-header, .chat-room-header');
      const toolsText = [...document.querySelectorAll('.v2-chat-compose-tools, .v2-tools-toggle')].map(el => (el.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean);
      const toolIcons = document.querySelectorAll('.v2-tool-icon-btn').length;
      const picker = document.querySelector('.participant-picker-button, .v2-chat-participant-missing');
      const map = document.querySelector('.v2-map-panel, .places-map-sticky-area');
      const r = el => el ? ({
        x: Math.round(el.getBoundingClientRect().x),
        w: Math.round(el.getBoundingClientRect().width),
        h: Math.round(el.getBoundingClientRect().height),
        mw: getComputedStyle(el).maxWidth,
        ml: getComputedStyle(el).marginLeft,
      }) : null;
      return {
        railW: rail ? Math.round(rail.getBoundingClientRect().width) : 0,
        brandText,
        brandImg: brandImg ? brandImg.getAttribute('src') : null,
        heroBrand: (heroBrand?.innerText || '').replace(/\s+/g,' ').trim().slice(0,40),
        main: r(main),
        shell: r(shell),
        header: header ? (header.innerText||'').replace(/\s+/g,' ').trim().slice(0,60) : null,
        legacyHeaderVisible: !!(legacyHeader && getComputedStyle(legacyHeader).display !== 'none' && legacyHeader.offsetParent !== null),
        toolsText,
        toolIcons,
        picker: picker ? (picker.innerText||'').replace(/\s+/g,' ').trim().slice(0,30) : null,
        map: r(map),
        placeBodyH: document.querySelector('.v2-places-body') && Math.round(document.querySelector('.v2-places-body').getBoundingClientRect().height),
      };
    });
    report[s.id] = info;
    await page.screenshot({ path: `${out}/loop9-${s.id}.png` });
    console.log(s.id, JSON.stringify(info));
  }
  fs.writeFileSync(`${out}/loop9-t175-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
