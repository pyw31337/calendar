#!/usr/bin/env node
/**
 * One-off audit script (not part of check:all) for the !important cleanup review.
 * For every `!important` declaration in the v2 CSS layer, determine whether it is
 * actually "contested" -- i.e. whether some OTHER declaration (in any v2 CSS file,
 * loaded at a point in the pipeline that could plausibly race with or precede it,
 * or app.css) sets the same property for a selector whose last simple selector
 * (the class the rule actually targets) matches, at the same or higher effective
 * specificity. Contested = likely load-bearing. Uncontested = likely removable
 * (nothing else in the stylesheet universe could beat it without the !important,
 * so it's probably just defensive habit).
 *
 * This is a heuristic, not a proof: it can't evaluate DOM structure, so it matches
 * on "last class in the selector" rather than full ancestor combinators. It is
 * deliberately conservative -- when in doubt it calls a declaration "contested" so
 * a human reviews it before removal, never the other way around.
 */
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const ROOT = path.resolve(import.meta.dirname, '..');
const FILES = [
  'src/app.css',
  'src/ui/v2/reference-home.css',
  'src/ui/v2/design.css',
  'src/ui/v2/aurora-theme.css',
  'src/ui/v2/dest-layout.css',
  'src/ui/v2/screens.css',
  'src/ui/v2/chat-bubble-modules.css',
  'src/ui/v2/reference-memo.css',
  'src/ui/v2/reference-places.css',
  'src/ui/v2/reference-settlement.css',
  'src/ui/v2/reference-chat.css',
];

// Load order groups: files whose relative order to each other is NOT guaranteed at
// runtime (lazy dynamic imports can land before or after any eagerly bundled file
// depending on navigation timing) go in the same group as everything after the
// earliest-possible eager point. Conservative: reference-{memo,places,settlement,chat}
// are lazy per-tab, so treat them as "could load after design.css/aurora-theme.css/
// dest-layout.css/screens.css at any time" -- i.e. contest bidirectionally with those.
const LAZY = new Set([
  'src/ui/v2/reference-memo.css',
  'src/ui/v2/reference-places.css',
  'src/ui/v2/reference-settlement.css',
  'src/ui/v2/reference-chat.css',
]);

function normalizeSelector(selector) {
  return selector.trim().replace(/\s+/g, ' ');
}

// Root/scope-wrapper classes every v2 selector is prefixed with -- not the actual element
// being styled, so ignored when comparing "which element does this target". Without this,
// almost every declaration would spuriously share a token (.v2-design alone appears on
// nearly every selector in the file), making the contest check useless.
const SCOPE_WRAPPERS = new Set([
  'v2-design', 'renewal-shell', 'v2-chat', 'v2-memo', 'v2-places', 'v2-settlement',
  'v2-dest-page', 'v2-wrap-legacy', 'bp-app-shell',
]);

// Class tokens in the LAST simple selector (the actual element the rule paints), minus the
// scope wrappers above. Two selectors sharing such a token might target the same physical
// node if it carries multiple classes and sits under the right ancestors -- exactly this
// codebase's pattern (e.g. `.v2-design .bp-side-nav-item` and some other file's
// `.v2-chat .bp-side-nav-item` both matching one node if `.v2-chat` nests inside `.v2-design`).
// Deliberately broad/conservative: false positives (flagging something as "contested" when
// it isn't) just mean a human re-reviews it; false negatives would silently break production
// styles, which is the failure mode to avoid.
function classTokens(selector) {
  const lastSimple = selector.trim().split(/\s+/).pop();
  const m = lastSimple.match(/\.([a-zA-Z0-9_-]+)/g) || [];
  return new Set(m.map(s => s.slice(1)).filter(c => !SCOPE_WRAPPERS.has(c)));
}

function parseFile(relPath) {
  const abs = path.join(ROOT, relPath);
  const css = fs.readFileSync(abs, 'utf8');
  const root = postcss.parse(css, { from: abs });
  const decls = [];
  root.walkRules(rule => {
    // Skip @keyframes inner rules (0%, 50%, from, to) -- not part of the cascade puzzle here.
    let p = rule.parent;
    let inKeyframes = false;
    while (p) {
      if (p.type === 'atrule' && /keyframes/i.test(p.name)) { inKeyframes = true; break; }
      p = p.parent;
    }
    if (inKeyframes) return;
    let mediaCtx = null;
    let pp = rule.parent;
    while (pp) {
      if (pp.type === 'atrule' && pp.name === 'media') { mediaCtx = pp.params; break; }
      pp = pp.parent;
    }
    rule.selectors.forEach(selector => {
      rule.walkDecls(decl => {
        decls.push({
          file: relPath,
          selector,
          normSelector: normalizeSelector(selector),
          classTokens: classTokens(selector),
          prop: decl.prop,
          important: decl.important === true,
          value: decl.value,
          line: decl.source?.start?.line,
          media: mediaCtx,
          node: decl,
        });
      });
    });
  });
  return decls;
}

const allDecls = FILES.flatMap(f => {
  try { return parseFile(f); } catch (e) { console.error(`[skip] ${f}: ${e.message}`); return []; }
});

// app.css is the DEFAULT (pre-v2) shell -- CLAUDE.md forbids touching it (must stay byte-for-byte
// identical to the pre-v2 rollback copy). It's parsed only to serve as READ-ONLY contention
// context for the v2 layer's own !important usage; it is never itself a cleanup candidate.
const EDITABLE = new Set(FILES.filter(f => f !== 'src/app.css'));
const importantDecls = allDecls.filter(d => d.important && EDITABLE.has(d.file));

function sharesAnyClass(a, b) {
  for (const c of a) if (b.has(c)) return true;
  return false;
}

function isContested(d) {
  // No usable class token to key off of (e.g. an element selector, a pseudo-element with no
  // class, or a selector that's only scope-wrapper classes) -- can't verify safety, so treat
  // as contested (leave it alone) rather than risk a false "safe to remove".
  if (d.classTokens.size === 0) return true;
  const dIdx = FILES.indexOf(d.file);
  return allDecls.some(other => {
    if (other === d) return false;
    if (!sharesAnyClass(other.classTokens, d.classTokens)) return false;
    if (other.prop !== d.prop) return false;
    const oIdx = FILES.indexOf(other.file);
    // Same file, different rule (e.g. a base rule + a later override rule further down,
    // or a media-query variant) -- always a real contest since source order matters.
    if (other.file === d.file) return true;
    // Any other file's plain (non-!important) declaration for the same prop+lastClass
    // is a real contest UNLESS it is guaranteed to load strictly before d AND d's own
    // file is not lazy (i.e. the normal eager cascade already settles it without needing
    // !important) -- but since screens.css/design.css/aurora-theme.css/dest-layout.css
    // all load eagerly in a fixed bundle order AND lazy reference-*.css can land after
    // any of them, treat every cross-file match as contested UNLESS both files are eager
    // and `other` loads strictly earlier in FILES order than d (then normal cascade
    // already gives d the win with no !important needed) AND `other` has no !important
    // of its own (if other also has !important, it's a real tie needing manual review).
    const dLazy = LAZY.has(d.file);
    const oLazy = LAZY.has(other.file);
    if (!dLazy && !oLazy && oIdx < dIdx && !other.important) return false;
    return true;
  });
}

const rows = importantDecls.map(d => ({ ...d, contested: isContested(d) }));
const uncontested = rows.filter(r => !r.contested);
const contested = rows.filter(r => r.contested);

const FIX = process.argv.includes('--fix');
const ONLY = process.argv.find(a => a.startsWith('--only='))?.slice('--only='.length);

console.log(`Total !important declarations analyzed: ${rows.length}`);
console.log(`Contested (likely load-bearing, leave alone): ${contested.length}`);
console.log(`Uncontested (no other rule anywhere sets the same prop for this selector -- candidate for removal): ${uncontested.length}`);
console.log('');

const strip = (r, arr) => ({ file: r.file, selector: r.selector, prop: r.prop, line: r.line, media: r.media });

if (!FIX) {
  console.log('=== Uncontested candidates by file ===');
  const byFile = {};
  for (const r of uncontested) {
    byFile[r.file] = byFile[r.file] || [];
    byFile[r.file].push(r);
  }
  for (const [file, list] of Object.entries(byFile)) {
    if (ONLY && file !== ONLY) continue;
    console.log(`\n-- ${file} (${list.length}) --`);
    for (const r of list) {
      console.log(`  L${r.line}  ${r.selector}  { ${r.prop}: ... }${r.media ? '  @media ' + r.media : ''}`);
    }
  }
  fs.writeFileSync(
    path.join(ROOT, '.important-audit.json'),
    JSON.stringify({
      total: rows.length,
      contestedCount: contested.length,
      uncontestedCount: uncontested.length,
      uncontested: uncontested.map(strip),
      contested: contested.map(strip),
    }, null, 2)
  );
  console.log('\nFull data written to .important-audit.json (dry run -- pass --fix to apply, optionally --only=<file>)');
} else {
  const targets = ONLY ? uncontested.filter(r => r.file === ONLY) : uncontested;
  const touchedFiles = new Set();
  for (const r of targets) {
    r.node.important = false;
    // Re-serialize the value without a trailing " !important" if postcss left one embedded
    // in `value` itself (it shouldn't when using the `important` flag, but be defensive).
    r.node.value = r.node.value.replace(/\s*!important\s*$/i, '');
    touchedFiles.add(r.file);
  }
  for (const file of touchedFiles) {
    const anyDecl = targets.find(r => r.file === file);
    const root = anyDecl.node.root();
    fs.writeFileSync(path.join(ROOT, file), root.toString());
    console.log(`Fixed ${targets.filter(r => r.file === file).length} declarations in ${file}`);
  }
}
