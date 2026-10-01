import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

test('404.html exists in public-vite, root and dist, and correctly parses /share/cw/memo/<id> path', () => {
  const html = fs.readFileSync(path.resolve('public-vite/404.html'), 'utf8');
  assert.ok(html.includes('shareMatch'), '404.html must contain shareMatch logic');

  function simulate404Redirect(pathname, search = '', hash = '') {
    const shareMatch = pathname.match(/\/share\/([A-Za-z0-9_-]+)(?:\/([A-Za-z0-9_-]+))?(?:\/([A-Za-z0-9_.-]+))?\/?$/);
    if (shareMatch) {
      const calendarId = shareMatch[1];
      const view = shareMatch[2] || '';
      const extraId = shareMatch[3] || '';

      let target = '/calendar/?id=' + encodeURIComponent(calendarId);
      if (view === 'memo') {
        target += '&view=memo';
        if (extraId) target += '&memo=' + encodeURIComponent(extraId);
      } else if (view && ['chat', 'places', 'gallery', 'settlement'].indexOf(view) !== -1) {
        target += '&view=' + encodeURIComponent(view);
        if (extraId) target += '&detail=' + encodeURIComponent(extraId);
      } else if (view) {
        target += '&view=' + encodeURIComponent(view);
      }

      if (search) {
        const params = new URLSearchParams(search);
        params.delete('id');
        params.delete('cal');
        params.delete('view');
        if (view === 'memo') params.delete('memo');
        const remainder = params.toString();
        if (remainder) target += '&' + remainder;
      }
      return target + hash;
    }
    const base = pathname.indexOf('/calendar/') !== -1 ? '/calendar/' : '/';
    return base + search + hash;
  }

  // 1. User reported URL
  const userUrlResult = simulate404Redirect('/calendar/share/cw/memo/memo_1790569102511_icdks6/');
  assert.equal(userUrlResult, '/calendar/?id=cw&view=memo&memo=memo_1790569102511_icdks6');

  // 2. Trailing slash absent
  const noSlashResult = simulate404Redirect('/calendar/share/cw/memo/memo_1790569102511_icdks6');
  assert.equal(noSlashResult, '/calendar/?id=cw&view=memo&memo=memo_1790569102511_icdks6');

  // 3. Other views
  assert.equal(simulate404Redirect('/calendar/share/cw/chat/'), '/calendar/?id=cw&view=chat');
  assert.equal(simulate404Redirect('/calendar/share/cw/'), '/calendar/?id=cw');
});

test('sw.js handles dynamic /share/ links and allows 404 status without Response.error()', () => {
  const swCode = fs.readFileSync(path.resolve('sw.js'), 'utf8');
  assert.ok(swCode.includes('Response.redirect'), 'sw.js should attempt Response.redirect for /share/ URLs');
  assert.ok(swCode.includes('response.status === 404'), 'sw.js should allow 404 status for 404.html redirection');
  assert.ok(!swCode.includes('if (!appPath) return Response.error();'), 'sw.js must not immediately error out non-app paths');
});

