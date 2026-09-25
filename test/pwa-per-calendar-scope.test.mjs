import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Android (Chrome/Samsung Internet/Whale) hands every URL inside an installed app's scope to that
// app. With one shared scope the first installed calendar swallowed the others ("installing 모아엘가
// opens 제이헤어"), so each calendar manifest must own a distinct /app/<id>/ scope.
const manifests = fs.readdirSync('.').filter(f => /^manifest-[A-Za-z0-9_-]+\.json$/.test(f));

test('each calendar manifest has its own /app/<id>/ scope and a start_url inside it', () => {
  assert.ok(manifests.length >= 2);
  const scopes = new Set();
  for (const file of manifests) {
    const id = file.match(/^manifest-(.+)\.json$/)[1];
    const m = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(m.scope, `./app/${id}/`, file);
    assert.ok(m.start_url.startsWith(m.scope), `${file} start_url outside scope`);
    assert.ok(m.id, `${file} keeps an explicit id so existing installs update in place`);
    scopes.add(m.scope);
  }
  assert.equal(scopes.size, manifests.length);
});

test('the build writes the /app/<id>/ pages and the root page only moves there when they exist', () => {
  const copy = fs.readFileSync('scripts/copy-static-to-dist.mjs', 'utf8');
  assert.match(copy, /<base href="\.\.\/\.\.\/" \/>/);
  assert.match(copy, /gather-app-paths/);
  const html = fs.readFileSync('src/index.html', 'utf8');
  assert.match(html, /meta\[name="gather-app-paths"\]/);
  assert.match(html, /history\.replaceState\(history\.state, '', rootPath \+ 'app\/' \+ id \+ '\/'/);
});

test('share/base URLs strip the /app/<id>/ path back to the site root', async () => {
  const { GATHER_APP_UTILS: utils } = await import('../src/core/app-utils.js');
  const loc = { origin: 'https://x.test', pathname: '/calendar/app/cw/' };
  assert.equal(utils.getAppBaseUrl(loc), 'https://x.test/calendar/');
  assert.equal(utils.getCalendarShareUrl('cw', loc), 'https://x.test/calendar/share/cw/');
});
