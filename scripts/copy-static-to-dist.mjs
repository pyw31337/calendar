
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

copyDir(path.join(root, 'share'), path.join(dist, 'share'));
copyDir(path.join(root, 'icons'), path.join(dist, 'icons'));
for (const f of ['og-thumb.jpg', 'og-thumb-v2.jpg', 'sw.js', 'favicon.ico', 'manifest.json', 'manifest-kkot.json', 'manifest-cw.json', 'manifest-jhair.json']) {
  const s = path.join(root, f);
  if (!fs.existsSync(s)) continue;
  if (f === 'sw.js') {
    const buildSha = process.env.VITE_BUILD_SHA || process.env.GITHUB_SHA || 'dev';
    const source = fs.readFileSync(s, 'utf8').replaceAll('__BUILD_SHA__', buildSha);
    fs.writeFileSync(path.join(dist, f), source);
  } else fs.copyFileSync(s, path.join(dist, f));
}
const pv = path.join(root, 'public-vite');
if (fs.existsSync(pv)) {
  for (const entry of fs.readdirSync(pv, { withFileTypes: true })) {
    const s = path.join(pv, entry.name);
    const d = path.join(dist, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (!fs.existsSync(d)) fs.copyFileSync(s, d);
  }
}
// Per-calendar install scope: dist/app/<id>/index.html for every manifest-<id>.json, so each
// calendar's home-screen app has its own scope (see the pwa-manifest-switch script in
// src/index.html). The copy is the built page plus <base href="../../"> so every relative URL
// still resolves against the site root. The root page gets a marker meta so its bootstrap only
// moves visitors to /app/<id>/ when these copies were actually shipped.
const distIndex = path.join(dist, 'index.html');
if (fs.existsSync(distIndex)) {
  const APP_PATHS_META = '<meta name="gather-app-paths" content="1" />';
  let html = fs.readFileSync(distIndex, 'utf8');
  if (!html.includes(APP_PATHS_META)) {
    html = html.replace(/<head>/i, `<head>\n    ${APP_PATHS_META}`);
    fs.writeFileSync(distIndex, html);
  }
  const appHtml = html.replace(/<head>/i, '<head>\n    <base href="../../" />');
  const ids = fs.readdirSync(root).map(f => f.match(/^manifest-([A-Za-z0-9_-]+)\.json$/)).filter(Boolean).map(m => m[1]);
  for (const id of ids) {
    const dir = path.join(dist, 'app', id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), appHtml);
  }
  console.log(`[copy-static-to-dist] app/<id>/ pages: ${ids.join(', ')}`);
}
console.log('[copy-static-to-dist] share/ synced to dist/');
