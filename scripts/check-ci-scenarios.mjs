import fs from 'node:fs';

const smoke = fs.readFileSync('scripts/browser-smoke-test.mjs', 'utf8');
const required = [
  ['places route', /view=places/],
  ['settlement route', /view=settlement/],
  ['map/cluster route coverage', /view=places[\s\S]*view=settlement/],
  ['mobile viewport', /width: 390/],
];
const missing = required.filter(([, pattern]) => !pattern.test(smoke));
for (const [label, pattern] of required) console.log(`${pattern.test(smoke) ? '✓' : '✗'} ${label}`);
if (missing.length) process.exit(1);
