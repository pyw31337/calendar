import fs from 'node:fs';
import path from 'node:path';

const UI_DIR = path.resolve('src/ui');
const UTILS_FILE = path.resolve('src/core/app-utils.js');
const DOMAIN_HELPERS_FILE = path.resolve('src/core/app-domain-helpers.js');

const utilsContent = fs.readFileSync(UTILS_FILE, 'utf8');
const domainContent = fs.readFileSync(DOMAIN_HELPERS_FILE, 'utf8');

function extractDeclaredFunctions(code) {
  const matches = [...code.matchAll(/function\s+([a-zA-Z0-9_$]+)\s*\(/g)];
  return new Set(matches.map(m => m[1]));
}

const globalHelperNames = new Set([
  ...extractDeclaredFunctions(utilsContent),
  ...extractDeclaredFunctions(domainContent)
]);

const IGNORE = new Set([
  'render', 'componentDidCatch', 'getDerivedStateFromError', 'useState', 'useEffect', 'useRef',
  'useCallback', 'useMemo', 'useContext', 'useReducer', 'useLayoutEffect', 'useImperativeHandle'
]);

function getJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      files.push(fullPath);
    }
  }
  return files;
}

const uiFiles = getJsFiles(UI_DIR);
let missingCount = 0;

for (const filePath of uiFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(process.cwd(), filePath);

  for (const helperName of globalHelperNames) {
    if (IGNORE.has(helperName)) continue;
    
    // Check if `helperName` is called in `content`
    const callRegex = new RegExp(`(?<![.\\w$])${helperName}\\s*\\(`, 'g');
    if (!callRegex.test(content)) continue;

    // `helperName` IS called in this file. Check if it is declared or guarded with `typeof === 'function'`
    const isDeclaredInFile =
      new RegExp(`function\\s+${helperName}\\b`).test(content) ||
      new RegExp(`const\\s+${helperName}\\b`).test(content) ||
      new RegExp(`let\\s+${helperName}\\b`).test(content) ||
      new RegExp(`var\\s+${helperName}\\b`).test(content) ||
      new RegExp(`[{,]\\s*${helperName}\\s*[,}]`).test(content) ||
      new RegExp(`typeof\\s+${helperName}\\s*===\\s*['"]function['"]`).test(content);

    if (!isDeclaredInFile) {
      console.error(`🚨 CRITICAL BUG: In ${relPath}: Calling '${helperName}' but wrapper/declaration/guard is MISSING!`);
      missingCount++;
    }
  }
}

if (missingCount === 0) {
  console.log('✅ AUDIT PASSED: All global helper function calls across src/ui/*.js are properly wrapped and guarded!');
} else {
  console.error(`❌ AUDIT FAILED: Found ${missingCount} missing helper wrapper(s) across src/ui/*.js!`);
  process.exit(1);
}
