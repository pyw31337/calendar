
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
for (const f of ['og-thumb.jpg', 'sw.js', 'manifest.json', 'manifest-kkot.json', 'manifest-cw.json', 'manifest-jhair.json']) {
  const s = path.join(root, f);
  if (fs.existsSync(s)) fs.copyFileSync(s, path.join(dist, f));
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
console.log('[copy-static-to-dist] share/ synced to dist/');
