import { execFileSync } from 'node:child_process';

const baselineWarnings = 4304;
const output = execFileSync('npx', ['eslint', '.', '-f', 'json'], {
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024
});
const results = JSON.parse(output);
const errors = results.reduce((total, file) => total + file.errorCount, 0);
const warnings = results.reduce((total, file) => total + file.warningCount, 0);

if (errors > 0) {
  console.error(`[lint-budget] failed: ${errors} lint error(s)`);
  process.exit(1);
}
if (warnings > baselineWarnings) {
  console.error(`[lint-budget] failed: warnings increased to ${warnings} (baseline ${baselineWarnings})`);
  process.exit(1);
}

console.log(`[lint-budget] passed: ${warnings} warning(s), baseline ${baselineWarnings}`);
