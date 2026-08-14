import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const MIRRORED_ASSETS = [
  'app-calendar-data.js',
  'app-config.js',
  'app-constants.js'
];

function hashFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

for (const filename of MIRRORED_ASSETS) {
  const rootAsset = `assets/${filename}`;
  const publicAsset = `public/assets/${filename}`;
  const rootHash = hashFile(rootAsset);
  const publicHash = hashFile(publicAsset);

  if (rootHash !== publicHash) {
    console.error(`Asset mirror mismatch: ${rootAsset} and ${publicAsset} differ.`);
    process.exit(1);
  }
}

console.log('Asset mirror check passed.');
