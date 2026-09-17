#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const before = JSON.parse(fs.readFileSync(path.join(ROOT, '.important-verify-before.json'), 'utf8'));
const after = JSON.parse(fs.readFileSync(path.join(ROOT, '.important-verify-after.json'), 'utf8'));

if (before.length !== after.length) {
  console.error(`Mismatched counts: before=${before.length} after=${after.length}`);
  process.exit(1);
}

let mismatches = 0;
let skipped = 0;
let matched = 0;
const mismatchList = [];
for (let i = 0; i < before.length; i++) {
  const b = before[i], a = after[i];
  if (b.skipped || a.skipped) { skipped++; continue; }
  if (b.value !== a.value) {
    mismatches++;
    mismatchList.push({ file: b.file, selector: b.selector, prop: b.prop, line: b.line, before: b.value, after: a.value });
  } else {
    matched++;
  }
}

console.log(`Matched (safe): ${matched}`);
console.log(`Skipped (unsupported selector shape, needs manual review): ${skipped}`);
console.log(`MISMATCHED (removal changed computed style -- revert these): ${mismatches}`);
if (mismatchList.length) {
  console.log('\n=== Mismatches ===');
  for (const m of mismatchList) {
    console.log(`  ${m.file}:${m.line}  ${m.selector} { ${m.prop} }  "${m.before}" -> "${m.after}"`);
  }
}
fs.writeFileSync(path.join(ROOT, '.important-verify-mismatches.json'), JSON.stringify(mismatchList, null, 2));

const skippedList = before.filter(b => b.skipped);
if (skippedList.length) {
  console.log('\n=== Skipped (unsupported selector shapes) ===');
  for (const s of skippedList) {
    console.log(`  ${s.file}:${s.line}  ${s.selector} { ${s.prop} }  (reason: ${s.reason})`);
  }
}
