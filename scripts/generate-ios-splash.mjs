// iOS home-screen launch images (apple-touch-startup-image, linked from src/index.html).
//
// Without them iOS shows a white screen from the tap until the page paints, and only then the
// HTML splash (#app-splash). Each image is a screenshot of that same splash -- its own CSS from
// src/index.html, animations at rest, safe-area top filled in per device -- with the per-calendar
// title and the loader left out (the HTML splash adds those a moment later), so the hand-off
// from the launch image to the page does not jump. Re-run after changing the splash or the icon:
//
//   node scripts/generate-ios-splash.mjs        (writes icons/splash/*.jpg, prints the <link>s)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
const css = html.match(/<style id="app-splash-style">([\s\S]*?)<\/style>/)[1];
const markup = html.match(/<div id="app-splash"[\s\S]*?\n {4}<\/div>\n/)[0];
const icon = `data:image/png;base64,${fs.readFileSync(path.join(root, 'icons/icon-v6-192.png')).toString('base64')}`;

// [css width, css height, pixel ratio, safe-area top in css px]
export const IOS_LAUNCH_DEVICES = [
  [440, 956, 3, 62], // 16 Pro Max
  [402, 874, 3, 62], // 16 Pro
  [430, 932, 3, 59], // 14/15 Pro Max, 15/16 Plus
  [393, 852, 3, 59], // 14/15 Pro, 15/16
  [428, 926, 3, 47], // 12/13 Pro Max, 14 Plus
  [390, 844, 3, 47], // 12/13/14, 12/13 Pro
  [375, 812, 3, 50], // X/XS/11 Pro, 12/13 mini
  [414, 896, 3, 48], // XS Max, 11 Pro Max
  [414, 896, 2, 48], // XR, 11
  [414, 736, 3, 20], // 6/7/8 Plus
  [375, 667, 2, 20], // 6/7/8, SE 2/3
];

const out = path.join(root, 'icons/splash');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const links = [];
for (const [width, height, dpr, safeTop] of IOS_LAUNCH_DEVICES) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr });
  const pageCss = css
    .replace(/env\(safe-area-inset-top,\s*0px\)/g, `${safeTop}px`)
    .replace(/env\(safe-area-inset-bottom,\s*0px\)/g, '34px');
  await page.setContent(`<!doctype html><html><head><style>${pageCss}
    html, body { margin: 0; background: #07021A; }
    .app-splash, .app-splash * { animation-play-state: paused !important; animation-delay: -10s !important; }
    .app-splash-shockwave, .app-splash-glint, .app-splash-title, .app-splash-sub, .app-splash-footer { visibility: hidden !important; }
  </style></head><body>${markup.replace(/src="icons\/icon-v6-192\.png"/, `src="${icon}"`)}</body></html>`);
  await page.waitForTimeout(150);
  const name = `launch-${width * dpr}x${height * dpr}.jpg`;
  // JPEG: the soft gradient is ~2MB per PNG, ~100KB here. iOS accepts JPEG launch images.
  await page.screenshot({ path: path.join(out, name), type: 'jpeg', quality: 86 });
  await page.close();
  links.push(`    <link rel="apple-touch-startup-image" media="(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)" href="icons/splash/${name}" />`);
}
await browser.close();
console.log(links.join('\n'));
