// Parse generated modules without executing them. A successful bundler run alone can still
// emit an undefined export after chunk splitting/minification, leaving the whole app unbootable.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const directory = join(process.cwd(), 'dist', 'assets');
const files = readdirSync(directory).filter(name => /\.(?:m?js)$/.test(name));
if (!files.length) throw new Error('No built JavaScript modules found');
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', join(directory, file)], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(`[dist-syntax] invalid module: ${file}`);
    console.error(String(result.stderr || result.error || '').slice(0, 1600));
    process.exit(1);
  }
}
console.log(`[dist-syntax] ${files.length} generated modules parse successfully`);
