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
// Split units bind several names at once from a shared alias object (e.g.
// `const { CalendarGrid, CommentsSection } = uiWrapperAliases;`, see U1a-c). This doesn't name a
// single declaration the way DECL_RE's other branches do, but it MUST still count as a boundary
// marker -- otherwise a preceding declaration's (e.g. CalendarApp's) measured span silently
// swallows everything up to the next DECL_RE match, however far away that is.
const DESTRUCTURE_RE = /^const\s*\{/;

const decls = [];
lines.forEach((line, index) => {
  const match = DECL_RE.exec(line);
  if (match) {
    decls.push({ name: match[1] || match[2], startLine: index + 1 });
    return;
  }
  if (DESTRUCTURE_RE.test(line)) {
    decls.push({ name: '(destructure)', startLine: index + 1, isBoundaryOnly: true });
  }
});

// Each declaration's span runs until the next one starts (or EOF) -- good enough for a line-count
// inventory; it doesn't need to understand the body to classify WRAPPER vs REAL.
for (let i = 0; i < decls.length; i += 1) {
  const endLine = i + 1 < decls.length ? decls[i + 1].startLine - 1 : lines.length;
  decls[i].endLine = endLine;
  decls[i].lineCount = endLine - decls[i].startLine + 1;
  const body = lines.slice(decls[i].startLine - 1, endLine).join('\n');
  decls[i].isWrapper = !decls[i].isBoundaryOnly && decls[i].lineCount <= WRAPPER_MAX_BODY_LINES
    && /GATHER_UI_COMPONENTS|GATHER_APP_UTILS/.test(body);
}

const namedDecls = decls.filter(d => !d.isBoundaryOnly);
const calendarApp = namedDecls.find(d => d.name === 'CalendarApp');
const wrapperCount = namedDecls.filter(d => d.isWrapper).length;
const realCount = namedDecls.length - wrapperCount - (calendarApp ? 1 : 0);

console.log(`[app-main-inventory] ${namedDecls.length} top-level declarations`);
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
  namedDecls.forEach(d => {
    const kind = d.name === 'CalendarApp' ? 'FROZEN' : (d.isWrapper ? 'WRAPPER' : 'REAL');
    console.log(`${d.name}\t${d.startLine}\t${d.endLine}\t${d.lineCount}\t${kind}`);
  });
}

if (failed) process.exit(1);
console.log('[app-main-inventory] passed');
