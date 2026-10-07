#!/usr/bin/env node

/**
 * Fail closed before a credential reaches Git, CI logs, or a deploy artifact.
 *
 * This is deliberately dependency-free: it runs before `npm ci` in CI and also
 * examines ignored local files.  Findings include only the path and rule name,
 * never the matching value.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIPPED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'coverage', '.firebase']);
const MAX_TEXT_BYTES = 2 * 1024 * 1024;

const FILENAME_RULES = [
  {
    name: 'firebase-admin-service-account-filename',
    pattern: /(?:^|[-_.])(firebase[-_]?adminsdk|service[-_]?account|service_account)(?:[-_.]|$).*\.(?:json|pem|p12|key)$/i,
  },
  { name: 'firebase-service-account-key-filename', pattern: /^serviceAccountKey\.json$/i },
];

const CONTENT_RULES = [
  { name: 'private-key-pem', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'service-account-private-key', pattern: /"private_key"\s*:\s*"-----BEGIN(?:\\n|\s)+(?:RSA )?PRIVATE KEY-----/ },
  { name: 'github-token', pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
];

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) walk(path.join(directory, entry.name), files);
      continue;
    }
    if (entry.isFile() || entry.isSymbolicLink()) files.push(path.join(directory, entry.name));
  }
  return files;
}

export function inspectCandidate(absolutePath, root = ROOT) {
  const relativePath = path.relative(root, absolutePath).split(path.sep).join('/');
  const findings = [];
  const basename = path.basename(absolutePath);
  for (const rule of FILENAME_RULES) {
    if (rule.pattern.test(basename)) findings.push({ path: relativePath, rule: rule.name });
  }

  let stat;
  try {
    stat = fs.statSync(absolutePath);
  } catch (_) {
    return findings;
  }
  if (stat.size === 0 || stat.size > MAX_TEXT_BYTES) return findings;

  let content;
  try {
    content = fs.readFileSync(absolutePath, 'utf8');
  } catch (_) {
    return findings;
  }
  // Do not try to parse arbitrary binary assets as text.
  if (content.includes('\0')) return findings;
  for (const rule of CONTENT_RULES) {
    if (rule.pattern.test(content)) findings.push({ path: relativePath, rule: rule.name });
  }
  return findings;
}

export function scanWorkspace(root = ROOT) {
  const findings = [];
  for (const file of walk(root)) findings.push(...inspectCandidate(file, root));
  return findings;
}

function main() {
  const findings = scanWorkspace();
  if (findings.length === 0) {
    console.log('[secret-scan] no credential-like files or values found');
    return;
  }
  console.error('[secret-scan] blocked credential-like material:');
  for (const finding of findings) console.error(`  - ${finding.path} (${finding.rule})`);
  process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
