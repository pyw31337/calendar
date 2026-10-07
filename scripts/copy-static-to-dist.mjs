
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const calendarIds = fs.readdirSync(root)
  .map(file => file.match(/^manifest-([A-Za-z0-9_-]+)\.json$/))
  .filter(Boolean)
  .map(match => match[1]);

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

// Only public calendar share entry points belong in the Pages artifact. Test/stress calendars
// are useful local fixtures, but publishing their static fallbacks makes them discoverable and
// needlessly increases every deploy. Dynamic memo/detail links still resolve through 404.html.
const shareSource = path.join(root, 'share');
const shareDest = path.join(dist, 'share');
for (const file of ['index.html', '.nojekyll']) {
  const source = path.join(shareSource, file);
  if (fs.existsSync(source)) {
    fs.mkdirSync(shareDest, { recursive: true });
    fs.copyFileSync(source, path.join(shareDest, file));
  }
}
for (const calendarId of calendarIds) copyDir(path.join(shareSource, calendarId), path.join(shareDest, calendarId));
const skippedShareDirectories = fs.existsSync(shareSource)
  ? fs.readdirSync(shareSource, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !calendarIds.includes(entry.name))
    .map(entry => entry.name)
  : [];
console.log(`[copy-static-to-dist] published share calendars: ${calendarIds.join(', ')}${skippedShareDirectories.length ? `; excluded local fixtures: ${skippedShareDirectories.length}` : ''}`);
copyDir(path.join(root, 'icons'), path.join(dist, 'icons'));
for (const f of ['404.html', 'og-thumb.jpg', 'og-thumb-v2.jpg', 'sw.js', 'favicon.ico', 'manifest.json', 'manifest-kkot.json', 'manifest-cw.json', 'manifest-jhair.json']) {
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
  for (const id of calendarIds) {
    const dir = path.join(dist, 'app', id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), appHtml);
  }
  console.log(`[copy-static-to-dist] app/<id>/ pages: ${calendarIds.join(', ')}`);
}

// MapLibre's ESM worker falls back to `new URL('./maplibre-gl-worker.mjs', import.meta.url)`.
// Vite fingerprints the emitted worker chunk, while GitHub Pages has no rewrite from that stable
// package filename to the fingerprinted asset. Publish a byte-identical fallback beside the
// generated asset so MapLibre can always start a worker, including in Samsung Internet.
const assetsDir = path.join(dist, 'assets');
const emittedMapLibreWorkers = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).filter(name => /^maplibre-gl-worker-[A-Za-z0-9_-]+\.js$/.test(name))
  : [];
if (emittedMapLibreWorkers.length !== 1) {
  throw new Error(`[copy-static-to-dist] expected one emitted MapLibre worker, found ${emittedMapLibreWorkers.length}`);
}
fs.copyFileSync(
  path.join(assetsDir, emittedMapLibreWorkers[0]),
  path.join(assetsDir, 'maplibre-gl-worker.mjs')
);

console.log('[copy-static-to-dist] static assets, app pages, and MapLibre worker fallback synced to dist/');
