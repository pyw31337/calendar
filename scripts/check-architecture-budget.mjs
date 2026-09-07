import fs from 'node:fs';

// Keep the coordinator from absorbing extracted feature code again. Photo-comment persistence
// now lives in photo-comments.js and UI compatibility wrappers are local to their actual chunk.
const targets = [
  { file: 'src/core/app-main.js', maxLines: 12700, label: 'app-main.js' },
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
