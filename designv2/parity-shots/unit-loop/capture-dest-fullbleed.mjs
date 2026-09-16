import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.UNIT_BASE || 'http://127.0.0.1:5179';
const OUT = 'designv2/parity-shots/unit-loop/dest-fullbleed';
fs.mkdirSync(OUT, { recursive: true });

const screens = [
  { id: 'chat-baseline', url: `${BASE}/?id=cw&shell=v2&tab=chat`, wait: '.v2-chat.v2-dest-page' },
  { id: 'memo', url: `${BASE}/?id=cw&shell=v2&tab=memo`, wait: '.v2-memo.v2-dest-page' },
  { id: 'places', url: `${BASE}/?id=cw&shell=v2&tab=places`, wait: '.v2-places.v2-dest-page' },
  { id: 'settlement', url: `${BASE}/?id=cw&shell=v2&tab=settlement`, wait: '.v2-settlement.v2-dest-page' },
  { id: 'gallery', url: `${BASE}/?id=cw&shell=v2&tab=records&sub=media`, wait: '.v2-gallery.v2-dest-page, .gallery-page-container' },
];

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const report = { base: BASE, capturedAt: new Date().toISOString(), screens: {} };

for (const screen of screens) {
  await page.goto(screen.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2800);
  try { await page.waitForSelector(screen.wait, { timeout: 12000 }); } catch {}
  await page.waitForTimeout(500);
  const metrics = await page.evaluate(() => {
    const qs = (s) => document.querySelector(s);
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1) };
    };
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const dest = qs('.v2-dest-page');
    const shell = qs('.v2-dest-page > .bp-app-shell, .v2-chat-root, .v2-chat-shell');
    const header = qs('.v2-page-header');
    const map = qs('.v2-map-panel');
    const rail = qs('.bp-side-nav');
    const root = qs('.v2-design');
    return {
      tokens: root
        ? {
            padX: cs(root).getPropertyValue('--v2-dest-pad-x').trim(),
            padY: cs(root).getPropertyValue('--v2-dest-pad-y').trim(),
            contentPadX: cs(root).getPropertyValue('--v2-dest-content-pad-x').trim(),
          }
        : null,
      railRight: rail ? +rail.getBoundingClientRect().right.toFixed(1) : null,
      dest: { ...rect(dest), margin: cs(dest)?.margin, padding: cs(dest)?.padding, maxWidth: cs(dest)?.maxWidth },
      shell: { ...rect(shell), margin: cs(shell)?.margin, padding: cs(shell)?.padding, maxWidth: cs(shell)?.maxWidth },
      header: rect(header),
      map: map ? { ...rect(map), margin: cs(map)?.margin } : null,
    };
  });
  const clip = {
    x: Math.floor(metrics.railRight || 280),
    y: 0,
    width: Math.min(980, 1280 - Math.floor(metrics.railRight || 280)),
    height: 720,
  };
  await page.screenshot({ path: `${OUT}/${screen.id}.png`, clip });
  report.screens[screen.id] = { url: screen.url, clip, metrics };
  console.log('captured', screen.id, metrics.shell?.padding, metrics.map?.margin);
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log('done', OUT);
