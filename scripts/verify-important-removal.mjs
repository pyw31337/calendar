#!/usr/bin/env node
/**
 * One-off verification harness for the !important cleanup (not part of check:all).
 *
 * For every candidate declaration in .important-audit.json (produced by audit-important.mjs),
 * builds a minimal real DOM tree matching its selector, loads the actual v2 stylesheets in the
 * actual app load order, and reads the browser's own computed style for that property. Run once
 * BEFORE removing any !important (`--mode=before`) and once AFTER (`--mode=after`), then diff
 * the two recordings -- any changed computed value means that removal was NOT actually safe
 * (the heuristic in audit-important.mjs missed a real contest) and must be reverted.
 *
 * This sidesteps needing live Firestore data or exhaustive manual visual review: the browser's
 * own cascade resolution is the ground truth, not a heuristic re-implementation of it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(import.meta.dirname, '..');
const mode = process.argv.find(a => a.startsWith('--mode='))?.slice('--mode='.length);
if (!['before', 'after'].includes(mode)) {
  console.error('Usage: node verify-important-removal.mjs --mode=before|after [--only=<file>]');
  process.exit(1);
}
const ONLY = process.argv.find(a => a.startsWith('--only='))?.slice('--only='.length);

const audit = JSON.parse(fs.readFileSync(path.join(ROOT, '.important-audit.json'), 'utf8'));
let candidates = audit.uncontested;
if (ONLY) candidates = candidates.filter(c => c.file === ONLY);

// Parse a selector into a chain of {combinator, tag, classes[], pseudo} simple selectors.
// Handles descendant (space) and child (>) combinators, class chains, and a small known set
// of pseudo-classes/elements. Anything it can't confidently model is flagged `unsupported`
// and skipped (left for manual review) rather than silently mis-verified.
function parseSelector(sel) {
  const trimmed = sel.trim();
  const tokens = trimmed.split(/\s*(>)\s*|\s+/).filter(t => t !== undefined && t !== '');
  const chain = [];
  let pendingCombinator = null;
  for (const tok of tokens) {
    if (tok === '>') { pendingCombinator = '>'; continue; }
    let pseudo = null;
    let base = tok;
    const pseudoMatch = base.match(/(::?[a-zA-Z-]+(\([^)]*\))?)+$/);
    if (pseudoMatch && /:(hover|active|focus|checked|before|after)\b/.test(pseudoMatch[0])) {
      pseudo = pseudoMatch[0];
      base = base.slice(0, base.length - pseudo.length);
    }
    if (/:has\(/.test(base) || /\[.*\]/.test(base) || /:not\(/.test(base) || /::-webkit/.test(tok)) {
      return { unsupported: true, reason: tok };
    }
    const classes = (base.match(/\.[a-zA-Z0-9_-]+/g) || []).map(c => c.slice(1));
    if (!classes.length && base) return { unsupported: true, reason: tok };
    chain.push({ combinator: pendingCombinator, classes, pseudo });
    pendingCombinator = null;
  }
  return { chain };
}

function buildMarkup(chain) {
  // Build outside-in: each selector segment becomes one nested ancestor div, with the last
  // (the actual rule target) marked for measurement.
  let html = '';
  let closeTags = '';
  for (let i = 0; i < chain.length; i++) {
    const seg = chain[i];
    const cls = seg.classes.join(' ');
    const isLast = i === chain.length - 1;
    html += `<div class="${cls}"${isLast ? ' data-probe="target"' : ''}>`;
    closeTags = '</div>' + closeTags;
  }
  html += closeTags;
  return html;
}

// Pick a viewport width that satisfies this declaration's @media condition (if any), so
// conditional rules actually get a chance to apply during measurement instead of silently
// being inactive at a default width (which would look like a false "no change" match).
function viewportForMedia(media) {
  if (!media) return 1280;
  const minM = media.match(/min-width:\s*(\d+)/);
  const maxM = media.match(/max-width:\s*(\d+)/);
  const min = minM ? Number(minM[1]) : null;
  const max = maxM ? Number(maxM[1]) : null;
  if (min != null && max != null) return Math.round((min + max) / 2);
  if (min != null) return min + 40;
  if (max != null) return Math.max(320, max - 10);
  return 1280;
}

const browser = await chromium.launch();

const cssLinks = [
  'src/ui/v2/reference-home.css',
  'src/ui/v2/design.css',
  'src/ui/v2/aurora-theme.css',
].map(f => `<link rel="stylesheet" href="file://${path.join(ROOT, f)}">`).join('\n');

const results = [];
for (const c of candidates) {
  const parsed = parseSelector(c.selector);
  if (parsed.unsupported) {
    results.push({ ...c, skipped: true, reason: parsed.reason });
    continue;
  }
  const markup = buildMarkup(parsed.chain);
  const html = `<!doctype html><html><head><meta charset="utf-8">${cssLinks}</head>
    <body class="v2-design renewal-shell"><div class="bp-app-shell">${markup}</div></body></html>`;
  // page.setContent() runs the page at an opaque about:blank-like origin, which Chromium's
  // local-resource policy silently blocks file:// stylesheets from loading into (no error
  // thrown by default -- computed styles just fall back to browser initial values, which
  // would make every before/after comparison spuriously "match"). Writing to a real .html
  // file on disk and page.goto()-ing it gives the page a genuine file:// origin instead.
  const tmpFile = path.join(ROOT, `.important-verify-probe-${mode}.html`);
  fs.writeFileSync(tmpFile, html);
  const page = await browser.newPage({ viewport: { width: viewportForMedia(c.media), height: 900 } });
  if (/prefers-reduced-motion:\s*reduce/.test(c.media || '')) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  }
  await page.goto(`file://${tmpFile}`);
  const lastSeg = parsed.chain[parsed.chain.length - 1];
  const pseudo = lastSeg.pseudo;
  if (pseudo === ':hover') {
    // force: true -- these are zero-content probe divs with no guaranteed visible bounding
    // box, so skip Playwright's actionability checks and dispatch the hover unconditionally.
    await page.hover('[data-probe="target"]', { force: true, timeout: 5000 }).catch(() => {});
  } else if (pseudo === ':active') {
    await page.hover('[data-probe="target"]', { force: true, timeout: 5000 }).catch(() => {});
    await page.mouse.down();
  }
  const value = await page.evaluate(({ prop, pseudo }) => {
    const el = document.querySelector('[data-probe="target"]');
    if (!el) return null;
    const pseudoArg = pseudo && /^::?(before|after)/.test(pseudo) ? pseudo.replace(/^:(?!:)/, '::') : null;
    const cs = window.getComputedStyle(el, pseudoArg);
    return cs.getPropertyValue(prop);
  }, { prop: c.prop, pseudo });
  await page.close();
  results.push({ ...c, value });
}

await browser.close();
try { fs.unlinkSync(path.join(ROOT, `.important-verify-probe-${mode}.html`)); } catch {}

const outFile = path.join(ROOT, `.important-verify-${mode}.json`);
fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
const skipped = results.filter(r => r.skipped).length;
console.log(`[${mode}] measured ${results.length - skipped} declarations, skipped ${skipped} (unsupported selector shape) -> ${outFile}`);
