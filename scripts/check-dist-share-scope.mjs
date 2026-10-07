import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const shareDir = path.join(root, 'dist', 'share');
const calendarIds = fs.readdirSync(root)
  .map(file => file.match(/^manifest-([A-Za-z0-9_-]+)\.json$/))
  .filter(Boolean)
  .map(match => match[1]);

if (!fs.existsSync(shareDir)) throw new Error('[dist-share-scope] dist/share is missing; run the production build first');
const allowed = new Set(['index.html', '.nojekyll', ...calendarIds]);
const unexpected = fs.readdirSync(shareDir).filter(name => !allowed.has(name));
if (unexpected.length) {
  throw new Error(`[dist-share-scope] unpublished fixture routes leaked into dist/share: ${unexpected.join(', ')}`);
}
for (const calendarId of calendarIds) {
  if (!fs.existsSync(path.join(shareDir, calendarId, 'index.html'))) {
    throw new Error(`[dist-share-scope] share/${calendarId}/index.html is missing`);
  }
}
console.log(`[dist-share-scope] only public share routes published: ${calendarIds.join(', ')}`);
