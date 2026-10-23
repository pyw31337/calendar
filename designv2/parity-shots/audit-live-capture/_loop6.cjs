const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:4173/?id=cw&shell=v2&tab=records&sub=media', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  const g = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('button')].filter(b => /^(사진|링크|파일)/.test((b.innerText||'').trim())).map(b => {
      const r = b.getBoundingClientRect();
      return { t: b.innerText.replace(/\s+/g,' ').trim(), x: Math.round(r.x), w: Math.round(r.width) };
    });
    return { tabs, scrollH: Math.round(document.querySelector('.gallery-page-scroll')?.getBoundingClientRect().height||0) };
  });
  console.log('gallery', JSON.stringify(g));
  await page.screenshot({ path: 'designv2/parity-shots/audit-live-capture/loop6-gallery.png' });

  await page.goto('http://127.0.0.1:4173/?id=cw&shell=v2&tab=chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape').catch(()=>{});
  const c = await page.evaluate(() => {
    const el = document.querySelector('.v2-chat-root');
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), x: Math.round(r.x), pills: [...document.querySelectorAll('.msg-row-hover > span')].slice(0,2).map(s=>s.innerText) };
  });
  console.log('chat', c);
  await page.screenshot({ path: 'designv2/parity-shots/audit-live-capture/loop6-chat.png' });
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
