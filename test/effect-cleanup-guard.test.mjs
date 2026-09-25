import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// An expression-bodied effect returns whatever its expression returns, and React calls that value
// as the cleanup. `useEffect(() => autoGrowTextarea(...), [...])` returned autoGrowTextarea's
// measurement object, so React crashed with "t is not a function" (the "화면 섹션을 불러오는 중
// 오류" screen on the places register sheet and memo edit). Expression bodies are allowed only
// for helpers whose contract is to return a cleanup function.
const CLEANUP_RETURNING = /^(subscribe|watch|sync|install)[A-Z]/;

function listFiles(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...listFiles(p));
    else if (/\.(js|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

test('expression-bodied effects only call cleanup-returning helpers', () => {
  const offenders = [];
  for (const file of listFiles('src')) {
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const m = line.match(/use(?:Layout)?Effect\(\(\)\s*=>\s*(?!\{)([A-Za-z_$][\w$.]*)\s*\(/);
      if (!m) return;
      const callee = m[1].split('.').pop();
      if (!CLEANUP_RETURNING.test(callee)) offenders.push(`${file}:${i + 1} ${callee}`);
    });
  }
  assert.deepEqual(offenders, [], 'wrap the call in a block body: useEffect(() => { fn(); }, deps)');
});
