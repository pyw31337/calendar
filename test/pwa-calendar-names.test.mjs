import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const expected = {
  cw: '모아엘가',
  kkot: '꽃잎반',
  jhair: '제이헤어'
};

test('calendar PWA manifests use the calendar name, not the service brand', () => {
  for (const [id, name] of Object.entries(expected)) {
    const manifest = JSON.parse(fs.readFileSync(`manifest-${id}.json`, 'utf8'));
    assert.equal(manifest.name, name, `manifest-${id}.json name`);
    assert.equal(manifest.short_name, name, `manifest-${id}.json short_name`);
  }
});

test('early PWA title maps keep install labels aligned with calendar identity', () => {
  for (const file of ['src/index.html', 'index.html']) {
    const html = fs.readFileSync(file, 'utf8');
    for (const name of Object.values(expected)) {
      assert.match(html, new RegExp(`(?:cw|kkot|jhair): ["']${name}["']`), `${file} includes ${name}`);
    }
    assert.doesNotMatch(html, /titleByCalendar\s*=\s*\{[^}]*Let's Calendar/);
  }
});
