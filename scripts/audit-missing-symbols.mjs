import fs from 'node:fs';
import path from 'node:path';

const UI_DIR = path.resolve('src/ui');
const CORE_DIR = path.resolve('src/core');

const JS_GLOBALS = new Set([
  'Math', 'Date', 'String', 'Array', 'Object', 'Number', 'Boolean', 'RegExp', 'JSON', 'Error',
  'TypeError', 'ReferenceError', 'SyntaxError', 'RangeError', 'URIError', 'Symbol', 'Promise',
  'Set', 'Map', 'WeakSet', 'WeakMap', 'ArrayBuffer', 'DataView', 'Float32Array', 'Float64Array',
  'Int8Array', 'Int16Array', 'Int32Array', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array',
  'console', 'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'parseInt', 'parseFloat',
  'isNaN', 'isFinite', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame',
  'cancelAnimationFrame', 'window', 'document', 'navigator', 'fetch', 'location', 'history', 'localStorage',
  'sessionStorage', 'alert', 'confirm', 'prompt', 'btoa', 'atob', 'URL', 'URLSearchParams', 'Blob', 'File',
  'FileReader', 'FormData', 'CustomEvent', 'Event', 'MutationObserver', 'ResizeObserver', 'IntersectionObserver',
  'React', 'ReactDOM', '__deps', '__comp', 'GATHER_APP_UTILS', 'GATHER_APP_NOTIFICATIONS', 'GATHER_APP_CONSTANTS',
  'GATHER_APP_CONFIG', 'GATHER_APP_CALENDAR_DATA', 'GATHER_APP_CHAT_DATA', 'GATHER_UI_DEPS', 'GATHER_UI_COMPONENTS',
  '__gatherUiDeps', 'isSettlementEnabledCalendarId', 'isSettlementCardMenuAllowed', 'isSettlementTabVisible',
  'INCOME_EXPENSE_CATEGORY', 'isValidCalendarId', 'Notification', 'CSS', 'KoreanLunarCalendar'
]);

const JS_KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'catch', 'function', 'return', 'import', 'export', 'try', 'finally', 'with'
]);

function removeCommentsAndStrings(code) {
  // Strip single-line comments, block comments, and strings
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, '""')
    .replace(/`[\s\S]*?`/g, '""');
}

function getJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getJsFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = [...getJsFiles(UI_DIR), ...getJsFiles(CORE_DIR)];

let hasError = false;

for (const filePath of allFiles) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const content = removeCommentsAndStrings(rawContent);
  const relPath = path.relative(process.cwd(), filePath);
  
  // Find all function calls: identifier(...)
  const callMatches = [...content.matchAll(/(?<![.\w$])([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)];
  const calledNames = new Set(callMatches.map(m => m[1]));

  for (const name of calledNames) {
    if (JS_GLOBALS.has(name) || JS_KEYWORDS.has(name)) continue;
    if (name.startsWith('use') && name[3] && name[3] === name[3].toUpperCase()) continue;
    
    // Check if `name` is declared in `rawContent`
    const isDeclared =
      new RegExp(`function\\s+${name}\\b`).test(rawContent) ||
      new RegExp(`const\\s+${name}\\b`).test(rawContent) ||
      new RegExp(`let\\s+${name}\\b`).test(rawContent) ||
      new RegExp(`var\\s+${name}\\b`).test(rawContent) ||
      new RegExp(`class\\s+${name}\\b`).test(rawContent) ||
      new RegExp(`\\b${name}\\s*:`).test(rawContent) ||
      new RegExp(`[{,]\\s*${name}\\s*[,}]`).test(rawContent) ||
      new RegExp(`\\b${name}\\s*=`).test(rawContent);

    if (!isDeclared) {
      console.error(`[AUDIT MISSING SYMBOL] In ${relPath}: Called '${name}' but it is NOT declared or imported in this file!`);
      hasError = true;
    }
  }
}

if (!hasError) {
  console.log('[AUDIT MISSING SYMBOLS] All UI and CORE files passed! No missing helper function calls found.');
} else {
  console.error('[AUDIT MISSING SYMBOLS] Audit found missing helper calls! Fix them immediately.');
}
