const { chromium } = require('playwright');
const fs = require('fs');
const out = 'designv2/parity-shots/audit-live-capture';

const screens = [
  { id: 'chat', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=chat', wait: 4500 },
  { id: 'gallery', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=media', wait: 5000 },
  { id: 'settlement', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=settlement', wait: 4500 },
  { id: 'places', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=places', wait: 4500 },
  { id: 'content', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=content', wait: 5000 },
  { id: 'archive', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=archive', wait: 5000 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const report = {};
  for (const s of screens) {
    await page.goto(s.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(s.wait);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
    const info = await page.evaluate(() => {
      const rail = document.querySelector('.bp-side-nav');
      const subtabs = [...document.querySelectorAll('.renewal-shell-subtab-item')].map(b => (b.innerText || '').trim());
      const subtabRow = document.querySelector('.renewal-shell-subtab-row');
      const subtabVisible = !!(subtabRow && subtabRow.offsetParent !== null && getComputedStyle(subtabRow).display !== 'none');
      const rows = [...document.querySelectorAll('.msg-row-hover')].slice(0, 4).map(r => {
        const st = r.getAttribute('style') || '';
        const own = st.includes('flex-end');
        const kids = [...r.children].map(c => ({ tag: c.tagName, cls: c.className, t: (c.innerText || '').slice(0, 40).replace(/\s+/g, ' ') }));
        const br = r.getBoundingClientRect();
        return { own, x: Math.round(br.x), w: Math.round(br.width), kids };
      });
      const ledger = document.querySelectorAll('.settlement-ledger-row').length;
      const placeCards = document.querySelectorAll('.place-card-row').length;
      const galleryTabs = [...document.querySelectorAll('button')].filter(b => /^(사진|링크|파일)/.test((b.innerText || '').trim())).map(b => {
        const r = b.getBoundingClientRect();
        return { t: b.innerText.replace(/\s+/g, ' ').trim(), x: Math.round(r.x) };
      });
      const noSubtab = !!document.querySelector('.v2-records-no-subtab');
      return {
        railW: rail ? Math.round(rail.getBoundingClientRect().width) : 0,
        subtabs,
        subtabVisible,
        noSubtab,
        rows,
        ledger,
        placeCards,
        galleryTabs,
        hasV2Chat: !!document.querySelector('.v2-chat-root, .v2-chat'),
        hasGallery: !!document.querySelector('.gallery-page-scroll, .v2-gallery'),
        hasSettlement: !!document.querySelector('.v2-settlement, .settlement-page-body'),
        hasPlaces: !!document.querySelector('.v2-places, .places-list-body'),
        hasContent: !!document.querySelector('.v2-content'),
        hasArchive: !!document.querySelector('.v2-archive'),
      };
    });
    report[s.id] = info;
    await page.screenshot({ path: `${out}/loop7-${s.id}.png` });
    console.log(s.id, JSON.stringify(info));
  }
  fs.writeFileSync(`${out}/loop7-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
