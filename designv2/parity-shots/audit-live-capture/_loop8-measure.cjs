const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Chat: scroll to top to show other-participant pills + meta under
  await page.goto('http://127.0.0.1:4173/?id=cw&shell=v2&tab=chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  await page.evaluate(() => {
    const sc = document.querySelector('.chat-messages-scroll, .v2-chat-scroll, [class*="chat"] [style*="overflow"]');
    if (sc) sc.scrollTop = 0;
    // also try any overflowY auto
    document.querySelectorAll('.v2-chat *').forEach(el => {
      const s = getComputedStyle(el);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 40) el.scrollTop = 80;
    });
  });
  await page.waitForTimeout(500);
  const chatM = await page.evaluate(() => {
    return [...document.querySelectorAll('.msg-row-hover')].slice(0, 5).map(r => {
      const own = (r.getAttribute('style') || '').includes('flex-end');
      const bubble = r.querySelector('div > div[style*="background"]') || r.children[own ? 1 : 1];
      const meta = [...r.querySelectorAll('span')].find(s => /^\d{1,2}:\d{2}/.test((s.innerText||'').trim()));
      const br = r.getBoundingClientRect();
      const bb = bubble?.getBoundingClientRect();
      const mb = meta?.getBoundingClientRect();
      return {
        own,
        rowH: Math.round(br.height),
        bubbleY: bb ? Math.round(bb.y) : null,
        metaY: mb ? Math.round(mb.y) : null,
        metaBelow: bb && mb ? mb.y >= bb.bottom - 2 : null,
        pill: !own ? (r.children[0]?.innerText || '') : null,
      };
    });
  });
  console.log('chatMeasure', JSON.stringify(chatM));
  await page.screenshot({ path: 'designv2/parity-shots/audit-live-capture/loop8-chat-others.png' });

  await page.goto('http://127.0.0.1:4173/?id=cw&shell=v2&tab=settlement', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const settleM = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.settlement-ledger-row')].slice(0, 5).map(r => Math.round(r.getBoundingClientRect().height));
    return { rowHeights: rows, avg: rows.length ? Math.round(rows.reduce((a,b)=>a+b,0)/rows.length) : 0 };
  });
  console.log('settleMeasure', settleM);
  await page.screenshot({ path: 'designv2/parity-shots/audit-live-capture/loop8-settlement.png' });

  await page.goto('http://127.0.0.1:4173/?id=cw&shell=v2&tab=places', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const placeM = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.place-card-row')].slice(0, 5).map(r => Math.round(r.getBoundingClientRect().height));
    return { rowHeights: rows, avg: rows.length ? Math.round(rows.reduce((a,b)=>a+b,0)/rows.length) : 0 };
  });
  console.log('placeMeasure', placeM);
  await page.screenshot({ path: 'designv2/parity-shots/audit-live-capture/loop8-places.png' });

  await page.goto('http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=archive', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  const arch = await page.evaluate(() => ({
    noSubtab: !!document.querySelector('.v2-records-no-subtab'),
    subtabVisible: !!(document.querySelector('.renewal-shell-subtab-row') && getComputedStyle(document.querySelector('.renewal-shell-subtab-row')).display !== 'none' && document.querySelector('.renewal-shell-subtab-row').offsetParent),
    title: document.querySelector('.places-view-header, .history-header-stack, h1, h2')?.innerText?.slice(0,80),
  }));
  console.log('archive', arch);
  await page.screenshot({ path: 'designv2/parity-shots/audit-live-capture/loop8-archive.png' });

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
