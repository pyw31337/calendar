import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workflowsDir = resolve('.github/workflows');
const forbiddenPatterns = [
  /megamart/i,
  /ashley/i,
  /naver booking/i,
  /booking monitor/i,
  /price monitor/i
];

const files = readdirSync(workflowsDir).filter((name) => /\.ya?ml$/i.test(name));
let failed = false;

for (const file of files) {
  const text = readFileSync(resolve(workflowsDir, file), 'utf8');
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      console.error(`[check-workflow-scope] ${file} contains out-of-scope workflow text: ${pattern}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('[check-workflow-scope] OK: calendar repo workflows contain no known external monitor jobs');
