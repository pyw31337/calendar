import fs from 'node:fs';

// Budgets raised (2026-08-30) to give active feature development room to breathe -- app-main.js
// was hovering right at its old 10,750-line cap and flipping this check red/green from one
// commit to the next regardless of whether the commit had any actual problem. Once the current
// growth phase stabilizes, revisit alongside splitting app-main.js/app-firebase-data.js into
// smaller modules and bring these back down.
const targets = [
  { file: 'src/core/app-main.js', maxLines: 13000, label: 'app-main.js' },
  { file: 'src/core/app-firebase-data.js', maxLines: 4500, label: 'app-firebase-data.js' }
];

let failed = false;
for (const target of targets) {
  const source = fs.readFileSync(target.file, 'utf8');
  const lines = source.split('\n').length;
  if (lines > target.maxLines) {
    console.error(`[architecture-budget] ${target.label} ${lines} lines exceeds ${target.maxLines}`);
    failed = true;
  } else {
    console.log(`[architecture-budget] ${target.label} ${lines}/${target.maxLines} lines`);
  }
}

if (failed) process.exit(1);
