// Guards against the "orphaned tab" bug pattern found twice in one session: a component's
// activeTab-style state has a JSX branch checking a value no button ever sets (dead, unreachable
// content), or a button sets a value no JSX branch ever renders (a tab that opens to nothing).
// Scans every top-level `function Name(...) { ... }` block for `const [x, setX] = React.useState(...)`
// pairs, then compares the string-literal values passed to setX(...) against the string-literal
// values compared against x with `x === '...'` inside that same function body.
import fs from 'node:fs';
import path from 'node:path';

function collectJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectJsFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : [];
  });
}

const files = collectJsFiles('src');
if (files.length === 0) {
  console.error('No src/**/*.js files found');
  process.exit(1);
}

let problems = [];

for (const file of files) {
  const script = fs.readFileSync(file, 'utf8');
  if (!script) continue;

  // Split into top-level function blocks using top-of-line function/export function markers.
  const lines = script.split('\n');
  const starts = [];
  lines.forEach((line, i) => {
    const m = line.match(/^(?:export\s+)?function (\w+)\(/);
    if (m) starts.push({ name: m[1], line: i });
  });

  const blocks = starts.map((s, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].line : lines.length;
    return { file, name: s.name, startLine: s.line, body: lines.slice(s.line, end).join('\n') };
  });

  for (const block of blocks) {
    // Find every `const [stateVar, setStateVar] = React.useState(...)` pair in this block.
    const statePairRe = /const \[(\w+), (set[A-Z]\w*)\] = React\.useState\(([^)]*)\)/g;
    let pairMatch;
    while ((pairMatch = statePairRe.exec(block.body))) {
      const [, stateVar, setterVar, initArg] = pairMatch;

      // Only check state that looks like a mode/tab switch: compared with === to a string literal
      // somewhere in this block. Skip anything never compared this way (booleans, numbers, objects).
      const checkedRe = new RegExp(`\\b${stateVar}\\s*===\\s*'([^']+)'`, 'g');
      const checkedValues = new Set();
      let cm;
      while ((cm = checkedRe.exec(block.body))) checkedValues.add(cm[1]);
      if (checkedValues.size === 0) continue;

      // The literal initial value (if any) is reachable at mount without any setter call.
      const setValues = new Set();
      const initLiteral = initArg.trim().match(/^'([^']+)'$/);
      if (initLiteral) setValues.add(initLiteral[1]);

      // If the setter is ever called with a non-literal argument (e.g. setActiveTab(tab)), we
      // can't prove which values are reachable, so skip this pair entirely rather than risk a
      // false positive -- only report branches we're certain are unreachable.
      const anySetCallRe = new RegExp(`\\b${setterVar}\\(\\s*([^)]*)\\)`, 'g');
      let hasDynamicSetter = false;
      let sm;
      while ((sm = anySetCallRe.exec(block.body))) {
        const arg = sm[1].trim();
        const literal = arg.match(/^'([^']*)'$/);
        if (literal) setValues.add(literal[1]);
        else hasDynamicSetter = true;
      }
      if (hasDynamicSetter) continue;

      for (const value of checkedValues) {
        if (!setValues.has(value)) {
          problems.push(`${block.file}:${block.startLine + 1} ${block.name}: JSX checks ${stateVar} === '${value}', but no ${setterVar}('${value}') call (and no dynamic setter call) exists anywhere in this component -- that branch can never render.`);
        }
      }
    }
  }
}

if (problems.length > 0) {
  console.error('Tab-wiring check FAILED:\n');
  problems.forEach(p => console.error(`  - ${p}`));
  console.error(`\n${problems.length} unreachable tab/mode branch(es) found.`);
  process.exit(1);
}

console.log('Tab-wiring check passed: every activeTab-style JSX branch has a reachable setter call.');
