import fs from 'fs';

const srcPath = 'src/core/app-main.js';
const outPath = 'src/core/subscriptions.js';
const src = fs.readFileSync(srcPath, 'utf8');

const names = [
  'subscribeMessages',
  'subscribePlaces',
  'subscribeMemos',
  'subscribeAnniversaries'
];

function extractFunction(src, name) {
  const needle = 'function ' + name + '(';
  const start = src.indexOf(needle);
  if (start === -1) throw new Error('missing function ' + name);
  if (src.indexOf(needle, start + 1) !== -1) throw new Error('duplicate function ' + name);
  let i = src.indexOf('{', start);
  if (i === -1) throw new Error('no body for ' + name);
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error('unclosed function ' + name);
}

const parts = names.map((name) => extractFunction(src, name));
const out = `/* P6-2 copy of Firestore subscription helpers from app-main.js
 * Live app still uses assets/app-main.js. Do not delete the originals yet.
 */
${parts.join('\n\n')}
`;
fs.writeFileSync(outPath, out);
console.log('wrote', outPath);
for (const name of names) console.log('copied', name);
