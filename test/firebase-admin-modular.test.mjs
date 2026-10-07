import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('server and operational scripts cannot reintroduce removed Admin SDK namespace APIs', () => {
  const files = ['functions', 'functions/test', 'scripts'].flatMap(directory => fs.readdirSync(directory)
    .filter(name => /\.(?:js|mjs|cjs)$/.test(name)).map(name => path.join(directory, name)));
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /require\(['"]firebase-admin['"]\)/, file);
    assert.doesNotMatch(source, /\badmin\.(?:firestore|storage|credential)\b/, file);
    assert.doesNotMatch(source, /\bapp\.(?:firestore|storage)\(\)/, file);
  }
});
