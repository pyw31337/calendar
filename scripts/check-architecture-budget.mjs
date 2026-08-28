import fs from 'node:fs';

const targets = [
  { file: 'src/core/app-main.js', maxLines: 10750, label: 'app-main.js' },
  { file: 'src/core/app-firebase-data.js', maxLines: 3600, label: 'app-firebase-data.js' }
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
