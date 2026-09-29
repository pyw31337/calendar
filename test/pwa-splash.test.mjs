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
});

test('all PWA manifests have background_color matching splash theme', () => {
  const manifestFiles = ['manifest.json', 'manifest-cw.json', 'manifest-kkot.json', 'manifest-jhair.json'];
  for (const file of manifestFiles) {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(content.background_color, '#09041F', `${file} background_color matches splash background`);
  }
});
