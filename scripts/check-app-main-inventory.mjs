import fs from 'node:fs';

// U0 guard for docs/app-main-split-units.md: a plain inventory of every top-level declaration
// in app-main.js, split into WRAPPER (a thin GATHER_UI_COMPONENTS/GATHER_UI_DEPS pass-through)
// vs REAL (actual logic), plus a hard ceiling on CalendarApp's own line count so future split
// units can only ever shrink it, never let code drift back in. This script does not move any
// code -- it is read-only inventory, wired into `check:all` as a tripwire.
const FILE = 'src/core/app-main.js';
const CALENDAR_APP_MAX_LINES = 7700;
const WRAPPER_MAX_BODY_LINES = 8;

const source = fs.readFileSync(FILE, 'utf8');
const lines = source.split('\n');

// Matches only column-0 top-level declarations -- the same convention every unit in the split
// plan relies on to find safe extraction boundaries without a real parser.
const DECL_RE = /^(?:async function|function)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(|^const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/;

const decls = [];
lines.forEach((line, index) => {
  const match = DECL_RE.exec(line);
  if (!match) return;
  const name = match[1] || match[2];
  decls.push({ name, startLine: index + 1 });
});

// Each declaration's span runs until the next one starts (or EOF) -- good enough for a line-count
// inventory; it doesn't need to understand the body to classify WRAPPER vs REAL.
for (let i = 0; i < decls.length; i += 1) {
  const endLine = i + 1 < decls.length ? decls[i + 1].startLine - 1 : lines.length;
  decls[i].endLine = endLine;
  decls[i].lineCount = endLine - decls[i].startLine + 1;
  const body = lines.slice(decls[i].startLine - 1, endLine).join('\n');
  decls[i].isWrapper = decls[i].lineCount <= WRAPPER_MAX_BODY_LINES
    && /GATHER_UI_COMPONENTS|GATHER_APP_UTILS/.test(body);
}

const calendarApp = decls.find(d => d.name === 'CalendarApp');
const wrapperCount = decls.filter(d => d.isWrapper).length;
const realCount = decls.length - wrapperCount - (calendarApp ? 1 : 0);

console.log(`[app-main-inventory] ${decls.length} top-level declarations`);
console.log(`[app-main-inventory] WRAPPER: ${wrapperCount}, REAL (non-CalendarApp): ${realCount}`);

let failed = false;

if (!calendarApp) {
  console.error('[app-main-inventory] failed: could not locate `function CalendarApp(` -- has it been renamed or already split?');
  failed = true;
} else {
  console.log(`[app-main-inventory] CalendarApp: lines ${calendarApp.startLine}-${calendarApp.endLine} (${calendarApp.lineCount}/${CALENDAR_APP_MAX_LINES})`);
  if (calendarApp.lineCount > CALENDAR_APP_MAX_LINES) {
    console.error(`[app-main-inventory] failed: CalendarApp grew to ${calendarApp.lineCount} lines, over the ${CALENDAR_APP_MAX_LINES}-line freeze ceiling (docs/app-main-split-units.md). Code is drifting back into the frozen closure instead of out of it.`);
    failed = true;
  }
}

// --dump prints the full per-declaration table (used to regenerate the split plan's unit
// tables by hand); the default run stays terse so it's cheap to run on every check:all.
if (process.argv.includes('--dump')) {
  console.log('');
  console.log('name\tstartLine\tendLine\tlineCount\tkind');
  decls.forEach(d => {
    const kind = d.name === 'CalendarApp' ? 'FROZEN' : (d.isWrapper ? 'WRAPPER' : 'REAL');
    console.log(`${d.name}\t${d.startLine}\t${d.endLine}\t${d.lineCount}\t${kind}`);
  });
}

if (failed) process.exit(1);
console.log('[app-main-inventory] passed');
