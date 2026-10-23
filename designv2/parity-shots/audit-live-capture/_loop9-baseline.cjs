const { chromium } = require('playwright');
const fs = require('fs');
const out = 'designv2/parity-shots/audit-live-capture';
const screens = [
  { id: 'places', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=places', wait: 5000 },
  { id: 'settlement', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=settlement', wait: 4500 },
  { id: 'content', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=content', wait: 5000 },
  { id: 'archive', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=archive', wait: 5000 },
  { id: 'chat', url: 'http://127.0.0.1:4173/?id=cw&shell=v2&tab=chat', wait: 4500 },
];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const report = {};
  for (const s of screens) {
    await page.goto(s.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(s.wait);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
    const info = await page.evaluate((id) => {
      const rail = document.querySelector('.bp-side-nav');
      const pick = (sel) => [...document.querySelectorAll(sel)].slice(0, 6).map(el => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          t: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
          h: Math.round(r.height), w: Math.round(r.width), x: Math.round(r.x), y: Math.round(r.y),
          pad: cs.padding, radius: cs.borderRadius, border: cs.borderTop, bg: cs.backgroundColor,
          fs: cs.fontSize, fw: cs.fontWeight, gap: cs.gap, display: cs.display,
          cls: (el.className || '').toString().slice(0, 80),
        };
      });
      const base = {
        railW: rail ? Math.round(rail.getBoundingClientRect().width) : 0,
        hasPlaces: !!document.querySelector('.v2-places, .places-list-body'),
        hasSettlement: !!document.querySelector('.v2-settlement, .settlement-page-body'),
        hasContent: !!document.querySelector('.v2-content'),
        hasArchive: !!document.querySelector('.v2-archive'),
        hasChat: !!document.querySelector('.v2-chat, .v2-chat-root'),
        placeCards: pick('.place-card-row, .bp-place-card'),
        placeMap: pick('.places-map-sticky-area, .bp-places-map, [class*="maplibre"], .maplibregl-map').slice(0, 2),
        placeList: pick('.places-list-body, .place-grid, .bp-place-grid').slice(0, 2),
        ledger: pick('.settlement-ledger-row, .bp-expense-row, .bp-settlement-card'),
        person: pick('.settlement-person-card'),
        summary: pick('.settlement-page-body > div > div[role="button"], .bp-settlement-card').slice(0, 3),
        contentCards: pick('.content-card, [class*="culture-card"], [class*="ContentCard"], .festival-card, .movie-card').slice(0, 4),
        archiveCards: pick('.history-card, [class*="memory-card"], [class*="person-card"], .archive-card').slice(0, 4),
        chips: pick('[class*="category-chip"], .chip, .underline-tabs button, .v2-content button').slice(0, 8),
        chatOwn: [...document.querySelectorAll('.msg-row-hover')].filter(r => (r.getAttribute('style')||'').includes('flex-end')).slice(0, 2).map(r => ({
          kids: [...r.children].map(c => ({ tag: c.tagName, t: (c.innerText||'').slice(0,30).replace(/\s+/g,' '), cls: (c.className||'').toString().slice(0,40) })),
        })),
      };
      // layout structure for places
      if (id === 'places') {
        const main = document.querySelector('.v2-places, .renewal-shell-main');
        const map = document.querySelector('.places-map-sticky-area');
        const list = document.querySelector('.places-list-body');
        base.placesLayout = {
          mainH: main && Math.round(main.getBoundingClientRect().height),
          mapH: map && Math.round(map.getBoundingClientRect().height),
          mapW: map && Math.round(map.getBoundingClientRect().width),
          listH: list && Math.round(list.getBoundingClientRect().height),
          cardAvg: base.placeCards.length ? Math.round(base.placeCards.reduce((a,b)=>a+b.h,0)/base.placeCards.length) : 0,
          stickyTabs: !!document.querySelector('.places-category-sticky-tabs'),
          toolbar: !!document.querySelector('.places-list-toolbar'),
          destPage: !!document.querySelector('.v2-dest-page.v2-places, .v2-places.v2-dest-page'),
          bpCards: document.querySelectorAll('.bp-place-card').length,
          legacyCards: document.querySelectorAll('.place-card-row').length,
        };
      }
      if (id === 'settlement') {
        base.settleLayout = {
          bpCards: document.querySelectorAll('.bp-settlement-card').length,
          ledgerN: document.querySelectorAll('.settlement-ledger-row').length,
          personN: document.querySelectorAll('.settlement-person-card').length,
          ledgerAvg: base.ledger.length ? Math.round(base.ledger.reduce((a,b)=>a+b.h,0)/base.ledger.length) : 0,
          tabs: [...document.querySelectorAll('.settlement-page-tabs button, .settlement-page-tabs [role="tab"]')].map(b => (b.innerText||'').trim()),
          sections: [...document.querySelectorAll('.settlement-page-body section, .v2-settlement-body section')].map(s => (s.innerText||'').slice(0,40).replace(/\s+/g,' ')),
        };
      }
      if (id === 'content' || id === 'archive') {
        const cards = [...document.querySelectorAll('.v2-content [class*="card"], .v2-archive [class*="card"], .v2-content article, .v2-archive article, .v2-content [role="listitem"], .grid > div')].slice(0, 8);
        base.grid = cards.map(el => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return { h: Math.round(r.height), w: Math.round(r.width), radius: cs.borderRadius, pad: cs.padding, fs: cs.fontSize, t: (el.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), cls: (el.className||'').toString().slice(0,60) };
        });
        base.header = (document.querySelector('.places-view-header')?.innerText || '').replace(/\s+/g,' ').trim().slice(0,80);
      }
      return base;
    }, s.id);
    report[s.id] = info;
    await page.screenshot({ path: `${out}/loop9-baseline-${s.id}.png` });
    console.log(s.id, JSON.stringify(info.placesLayout || info.settleLayout || { rail: info.railW, cards: (info.contentCards||info.archiveCards||info.placeCards||info.ledger||[]).length, grid: (info.grid||[]).length }));
  }
  fs.writeFileSync(`${out}/loop9-baseline-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
  console.log('wrote report');
})().catch(e => { console.error(e); process.exit(1); });
