import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:4173';
const OUT = 'designv2/parity-shots/phase0-mobile/default';
fs.mkdirSync(OUT, { recursive: true });

// Default shell full-page destinations often use view= or are opened via menu.
// Try several URL patterns used historically.
const attempts = [
  { id: 'chat', urls: ['/?id=cw&view=chat', '/?id=cw&tab=chat', '/?id=cw&page=chat'] },
  { id: 'memo', urls: ['/?id=cw&view=memo', '/?id=cw&tab=memo'] },
  { id: 'gallery', urls: ['/?id=cw&view=gallery', '/?id=cw&tab=gallery', '/?id=cw&tab=records&sub=media'] },
  { id: 'places', urls: ['/?id=cw&view=places', '/?id=cw&tab=places'] },
  { id: 'settlement', urls: ['/?id=cw&view=settlement', '/?id=cw&tab=settlement'] },
  { id: 'content', urls: ['/?id=cw&view=content', '/?id=cw&tab=content', '/?id=cw&tab=records&sub=content'] },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();

async function openViaSideMenu(labelContains) {
  await page.goto(`${BASE}/?id=cw`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  // open hamburger
  const menuBtn = page.locator('button[aria-label*="메뉴"], button[aria-label*="menu"]').first();
  if (await menuBtn.count()) await menuBtn.click().catch(() => {});
  else {
    // last icon in header
    const icons = page.locator('header button, .app-header button, button').filter({ has: page.locator('svg') });
    const n = await icons.count();
    if (n) await icons.nth(Math.min(n - 1, 2)).click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(800);
  // click menu item
  const item = page.getByText(labelContains, { exact: true }).first();
  if (await item.count()) {
    await item.click({ force: true }).catch(() => {});
    await page.waitForTimeout(3500);
    return true;
  }
  // partial
  const partial = page.locator(`text=${labelContains}`).first();
  if (await partial.count()) {
    await partial.click({ force: true }).catch(() => {});
    await page.waitForTimeout(3500);
    return true;
  }
  return false;
}

const report = {};
for (const a of attempts) {
  let best = null;
  for (const u of a.urls) {
    await page.goto(`${BASE}${u}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
    await page.keyboard.press('Escape').catch(() => {});
    const info = await page.evaluate(() => {
      const hasChat = !!document.querySelector('.chat-messages-scroll, .chat-room, [class*="chat-composer"], textarea[placeholder*="메시지"]');
      const hasMemo = !!document.querySelector('[placeholder*="메모"], .memo-list, [class*="memo-"]');
      const hasGallery = !!document.querySelector('.gallery-page-container, .gallery-page-scroll, [class*="gallery"]');
      const hasPlaces = !!document.querySelector('[placeholder*="장소"], .places-list, [class*="place"]');
      const hasSettlement = !!document.querySelector('[class*="settlement"], text=정산');
      const hasContent = !!document.querySelector('[class*="content"], text=컨텐츠');
      const title = (document.querySelector('h1,h2,.page-title,.modal-title')?.innerText || '').slice(0, 40);
      const bodyText = document.body.innerText.slice(0, 200).replace(/\s+/g, ' ');
      return { hasChat, hasMemo, hasGallery, hasPlaces, hasSettlement, hasContent, title, bodyText, url: location.href };
    });
    console.log(a.id, u, JSON.stringify(info).slice(0, 200));
    if ((a.id === 'chat' && info.hasChat) || (a.id === 'memo' && info.hasMemo) ||
        (a.id === 'gallery' && info.hasGallery) || (a.id === 'places' && info.hasPlaces) ||
        (a.id === 'settlement' && (info.hasSettlement || /정산/.test(info.bodyText))) ||
        (a.id === 'content' && (info.hasContent || /컨텐츠|문화/.test(info.bodyText)))) {
      best = { via: u, info };
      await page.screenshot({ path: `${OUT}/${a.id}.png`, fullPage: false });
      break;
    }
  }
  if (!best) {
    const labels = { chat: '채팅', memo: '메모', gallery: '갤러리', places: '장소', settlement: '정산', content: '컨텐츠' };
    const ok = await openViaSideMenu(labels[a.id]);
    const info = await page.evaluate(() => ({ url: location.href, body: document.body.innerText.slice(0, 150).replace(/\s+/g,' ') }));
    console.log(a.id, 'menu', ok, JSON.stringify(info).slice(0, 180));
    await page.screenshot({ path: `${OUT}/${a.id}.png`, fullPage: false });
    best = { via: 'menu', info, ok };
  }
  report[a.id] = best;
}

// side menu open shot
await page.goto(`${BASE}/?id=cw`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3500);
const menuBtn = page.locator('button[aria-label*="메뉴"]').first();
if (await menuBtn.count()) await menuBtn.click();
else {
  const icons = page.locator('button').filter({ has: page.locator('svg') });
  const n = await icons.count();
  if (n >= 2) await icons.nth(1).click({ force: true });
}
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/side-menu.png`, fullPage: false });

fs.writeFileSync('designv2/parity-shots/phase0-mobile/default-dest-report.json', JSON.stringify(report, null, 2));
await browser.close();
console.log('done');
