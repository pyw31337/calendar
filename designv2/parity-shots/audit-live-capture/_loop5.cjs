const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const [n,q] of [['loop5-chat','tab=chat'],['loop5-gallery','tab=records&sub=media'],['loop5-memo','tab=memo'],['loop5-settlement','tab=settlement']]) {
    await page.goto('http://127.0.0.1:4173/?id=cw&shell=v2&'+q, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await page.keyboard.press('Escape').catch(()=>{});
    await page.screenshot({ path: 'designv2/parity-shots/audit-live-capture/'+n+'.png' });
    const info = await page.evaluate(() => ({
      chatRoot: !!document.querySelector('.v2-chat-root'),
      pills: [...document.querySelectorAll('.msg-row-hover > span')].slice(0,3).map(s => ({t:s.innerText, fs:getComputedStyle(s).fontSize})),
      galleryScrollH: document.querySelector('.gallery-page-scroll') && Math.round(document.querySelector('.gallery-page-scroll').getBoundingClientRect().height),
      imgs: document.querySelectorAll('.gallery-page-scroll img').length
    }));
    console.log(n, JSON.stringify(info));
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
