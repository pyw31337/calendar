import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const scopes = [
  { name: 'web', cwd: root },
  { name: 'functions', cwd: path.join(root, 'functions') }
];
let failed = false;

for (const scope of scopes) {
  const result = spawnSync('npm', ['audit', '--json'], {
    cwd: scope.cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.error) {
    console.error(`[npm-audit] ${scope.name}: could not run npm audit (${result.error.message})`);
    failed = true;
    continue;
  }
  let report;
  try {
    report = JSON.parse(result.stdout || '{}');
  } catch (_) {
    console.error(`[npm-audit] ${scope.name}: npm audit did not return JSON`);
    failed = true;
    continue;
  }
  const vulnerabilities = report.metadata?.vulnerabilities || {};
  const high = Number(vulnerabilities.high || 0);
  const critical = Number(vulnerabilities.critical || 0);
  const moderate = Number(vulnerabilities.moderate || 0);
  console.log(`[npm-audit] ${scope.name}: critical ${critical}, high ${high}, moderate ${moderate}`);
  if (high || critical) failed = true;
}

if (failed) {
  console.error('[npm-audit] high/critical dependency vulnerabilities block verification');
  process.exit(1);
}
