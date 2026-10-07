import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap(entry => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(target);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [target] : [];
  });
}

function importsFrom(source) {
  const specs = new Set();
  for (const match of source.matchAll(/\b(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g)) specs.add(match[1]);
  for (const match of source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) specs.add(match[1]);
  return [...specs];
}

function projectPath(file, specifier) {
  if (!specifier.startsWith('.')) return specifier.replaceAll('\\', '/');
  return path.normalize(path.resolve(path.dirname(file), specifier)).replace(root, '').replaceAll('\\', '/');
}

const violations = [];
function inspect(directory, check, { exclude = () => false } = {}) {
  for (const file of walk(path.join(root, directory))) {
    if (exclude(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    for (const specifier of importsFrom(source)) {
      const target = projectPath(file, specifier);
      const reason = check(target);
      if (reason) violations.push(`${path.relative(root, file)} → ${specifier}: ${reason}`);
    }
  }
}

// Core is intentionally UI-framework free. It can be imported by a view but never imports a
// view back; otherwise a route split silently pulls a screen into the startup graph.
inspect('src/core', target => (
  target.startsWith('/src/ui/') || target.startsWith('src/ui/')
    ? 'core modules must not depend on UI modules'
    : null
), {
  // app-main is the explicit composition root: it wires the selected UI shell to pure domain
  // controllers. All other core files remain view-free and are guarded here.
  exclude: file => path.basename(file) === 'app-main.js'
});

// Browser modules may call browser Firebase APIs through their compatibility bridge, but server
// Admin/Functions SDKs must stay in functions/ so credentials can never reach a Vite bundle.
inspect('src/ui', target => (
  target === 'firebase-admin' || target === 'firebase-functions' || target.startsWith('firebase-functions/')
    ? 'browser UI must not import server Firebase SDKs'
    : null
));

// Functions must be deployable independently of the Vite client. Sharing pure contracts belongs
// in a dedicated package/module, not via a relative import of the application tree.
inspect('functions', target => (
  target.startsWith('/src/') || target.startsWith('src/')
    ? 'Cloud Functions must not import Vite client source'
    : null
));

if (violations.length) {
  console.error('[architecture-boundaries] boundary violations found:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('[architecture-boundaries] core/UI/server dependency boundaries are intact');
