/**
 * Share URL rule: generators must use /share/{calId}/... not ?id=&view=
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['assets/app-utils.js', 'assets/ui-share-modal.js', 'assets/app-main.js'];
let failed = false;

for (const rel of files) {
  const text = readFileSync(resolve(root, rel), 'utf8');
  for (const line of text.split('\n')) {
    if (/\?id=/.test(line) && /(share|ShareUrl|getCalendarShareUrl|getViewShareUrl|getMemoItemShareUrl)/.test(line)) {
      if (line.trim().startsWith('//')) continue;
      console.error('[check-share-urls]', rel + ':', line.trim().slice(0, 120));
      failed = true;
    }
  }
}
const utils = readFileSync(resolve(root, 'assets/app-utils.js'), 'utf8');
for (const name of ['getCalendarShareUrl', 'getViewShareUrl', 'getMemoItemShareUrl', 'parseSharePathFromLocation']) {
  if (!utils.includes('function ' + name)) {
    console.error('[check-share-urls] missing', name);
    failed = true;
  }
}
if (!utils.includes('share/')) {
  console.error('[check-share-urls] utils missing /share/ path');
  failed = true;
}
if (failed) process.exit(1);
console.log('[check-share-urls] OK');
