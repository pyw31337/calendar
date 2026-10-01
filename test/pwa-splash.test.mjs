import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('PWA splash screen is embedded in src/index.html with zero-delay CSS and branding', () => {
  const html = fs.readFileSync('src/index.html', 'utf8');

  // Verify splash structure and key elements
  assert.match(html, /id="app-splash"/, 'src/index.html contains #app-splash element');
  assert.match(html, /class="app-splash-icon"/, 'src/index.html contains app icon');
  assert.match(html, /id="app-splash-title"/, 'src/index.html contains splash title');
  assert.match(html, /class="app-splash-loader"/, 'src/index.html contains splash loader');
  assert.match(html, /class="app-splash-loader-bar"/, 'src/index.html contains splash loader bar');

  // Verify inline splash styles for immediate 0ms paint
  assert.match(html, /<style id="app-splash-style">/, 'src/index.html contains inline splash styles');
  assert.match(html, /bp-splash-aura/, 'splash styles define aurora animation');
  assert.match(html, /bp-splash-bar-slide/, 'splash styles define progress loader animation');
  assert.match(html, /bp-splash-icon-breathe/, 'splash styles define icon breathing animation');

  // Verify startup timestamp for smooth dismiss timing
  assert.match(html, /window\.__GATHER_SPLASH_START__\s*=\s*Date\.now\(\);/, 'records splash start time');
});

test('PWA splash screen dismiss logic is integrated into main.jsx boot lifecycle', () => {
  const mainJs = fs.readFileSync('src/main.jsx', 'utf8');

  // Verify dismiss function and integration
  assert.match(mainJs, /function dismissSplashScreen\(\)/, 'main.jsx defines dismissSplashScreen');
  assert.match(mainJs, /window\.__GATHER_BOOT_READY__\s*=\s*true;\s*dismissSplashScreen\(\);/, 'dismissSplashScreen is called once boot is ready');

  // Verify fallback cleanup on boot status or error
  assert.match(mainJs, /showBootStatus[\s\S]*?app-splash[\s\S]*?splash\.remove\(\)/, 'showBootStatus cleans up splash overlay');
  // The normal "loading" status at the start of boot() must leave the splash up; it used to
  // remove it ~0.2-0.5s after launch, so phones showed a gray loading line instead.
  assert.match(mainJs, /showBootStatus\('모여라 캘린더 불러오는 중…', \{ keepSplash: true \}\)/);
});

test('iOS launch images exist for every linked iPhone size', () => {
  const html = fs.readFileSync('src/index.html', 'utf8');
  const hrefs = [...html.matchAll(/rel="apple-touch-startup-image"[^>]*href="([^"]+)"/g)].map(m => m[1]);
  assert.ok(hrefs.length >= 10, 'one launch image per supported iPhone screen');
  for (const href of hrefs) assert.ok(fs.existsSync(href), `${href} exists`);
});

test('all PWA manifests have background_color matching splash theme', () => {
  const manifestFiles = ['manifest.json', 'manifest-cw.json', 'manifest-kkot.json', 'manifest-jhair.json'];
  for (const file of manifestFiles) {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(content.background_color, '#09041F', `${file} background_color matches splash background`);
  }
});

test('splash screen is suppressed on PC / desktop environment to prevent jarring flicker', () => {
  const html = fs.readFileSync('src/index.html', 'utf8');
  const rootHtml = fs.readFileSync('index.html', 'utf8');
  const mainJs = fs.readFileSync('src/main.jsx', 'utf8');

  // Verify CSS suppresses splash on PC / desktop
  assert.match(html, /html\.is-pc-device\s+\.app-splash[\s\S]*?display:\s*none\s*!important/, 'src/index.html hides splash for is-pc-device');
  assert.match(html, /@media\s*\(min-width:\s*1024px\)\s*and\s*\(hover:\s*hover\)[\s\S]*?display:\s*none\s*!important/, 'src/index.html hides splash on desktop media query');
  assert.match(rootHtml, /html\.is-pc-device\s+\.app-splash/, 'index.html hides splash for is-pc-device');

  // Verify early head PC device class detection
  assert.match(html, /document\.documentElement\.classList\.add\(['"]is-pc-device['"]\)/, 'src/index.html adds is-pc-device class early in head');
  assert.match(rootHtml, /document\.documentElement\.classList\.add\(['"]is-pc-device['"]\)/, 'index.html adds is-pc-device class early in head');

  // Verify main.jsx dismissSplashScreen immediate PC bypass
  assert.match(mainJs, /isPC[\s\S]*?splash\.remove\(\)[\s\S]*?return;/, 'main.jsx removes splash immediately on PC');
});

