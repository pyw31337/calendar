import { execFileSync } from 'node:child_process';

const files = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', '*.js', '*.jsx', '*.mjs'], { encoding: 'utf8' })
  .split(/\r?\n/).map(file => file.trim()).filter(Boolean);
if (!files.length) {
  console.log('[lint:changed] no changed JavaScript files');
  process.exit(0);
}
try {
  // The live source is intentionally split into wrapper modules whose imported
  // symbols are consumed by the runtime assembler, so the repository-wide lint
  // pass has a known warning baseline. New errors must still fail this guard.
  execFileSync('npx', ['eslint', '--quiet', ...files], { stdio: 'inherit' });
  console.log(`[lint:changed] ${files.length} changed file(s) have no lint errors (legacy warnings remain covered by lint)`);
} catch (error) {
  process.exit(error.status || 1);
}
