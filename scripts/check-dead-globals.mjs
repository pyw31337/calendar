// Guards against exactly the class of bug that caused a runaway Firestore read bill: a
// `window.SOME_GLOBAL` read whose SOME_GLOBAL is never assigned anywhere in src/, so the read
// silently and permanently returns undefined/null instead of throwing. That kind of bug produces
// no crash, no failing test, and no visible symptom -- affected code just quietly takes its
// fallback path forever (in the incident this guarded, a 6-second REST poll instead of a live
// Firestore listener, on every client, for the app's entire life). Nothing else in check:all
// would have caught it.
//
// This is necessarily a heuristic (a plain text scan, not real scope/binding analysis), so a
// name assigned only conditionally, or via a dynamic key, or from outside src/ (e.g. injected by
// index.html or a third-party script tag) can still slip through as a false negative. It is not
// a substitute for care when introducing a new window.* bridge between modules -- only a backstop
// for the specific "read a name that flat-out never gets written" case.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function collectJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectJsFiles(full));
    else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) out.push(full);
  }
  return out;
}

// Strips // line comments and /* */ block comments (naive, string-literal-unaware) so a comment
// that merely *mentions* a dead-global name for documentation (as this incident's own fix
// commits do) doesn't get misread as a real reference.
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/([^:])\/\/.*$/gm, '$1');
}

const files = collectJsFiles(resolve(root, 'src'));
const sources = files.map(file => ({ file, text: stripComments(readFileSync(file, 'utf8')) }));

const GLOBAL_NAME = /window\.((?:__gather|GATHER_)[A-Za-z0-9_]+)/g;
const written = new Set();
const read = new Map(); // name -> first file it's read in

for (const { file, text } of sources) {
  let match;
  GLOBAL_NAME.lastIndex = 0;
  while ((match = GLOBAL_NAME.exec(text))) {
    const name = match[1];
    const afterName = text.slice(match.index + match[0].length);
    // Treat `window.NAME =` (not `==`/`===`) as an assignment. Covers the codebase's actual
    // patterns (`window.X = value`, `window.X = window.X || {}`) without needing a full parser.
    if (/^\s*=(?!=)/.test(afterName)) {
      written.add(name);
    } else if (!read.has(name)) {
      read.set(name, file.replace(root + '/', ''));
    }
  }
}

// Known, deliberately-external bridges: assigned outside src/ (index.html, a CDN script, or a
// build step) rather than by any module here, so "never written in src/" is expected for these.
const ALLOWLIST = new Set([
  // Nominatim endpoint override -- optional operator config, has a hardcoded default fallback.
  'GATHER_PLACE_SEARCH_NOMINATIM_ENDPOINT'
]);

const deadReads = [...read.entries()].filter(([name]) => !written.has(name) && !ALLOWLIST.has(name));

if (deadReads.length) {
  console.error('[check-dead-globals] window.* names read via `typeof`/direct access but never assigned anywhere in src/:');
  deadReads.forEach(([name, file]) => console.error(`  - window.${name} (first read in ${file})`));
  console.error('[check-dead-globals] If genuinely dead, remove the read site. If assigned outside src/ (index.html, a script tag, a build step), add it to ALLOWLIST in this script with a comment saying where.');
  process.exit(1);
}
console.log(`[check-dead-globals] OK: ${written.size} window.* globals all have a live writer (${read.size} distinct names read, ${ALLOWLIST.size} allowlisted)`);
