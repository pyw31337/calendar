import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  APP_PAGE_SLUGS, parseAppPath, pageFromParams, routeSearchParams, displayAddress, toDisplayUrl,
  readAddressMonth, installCanonicalAddress,
} from '../src/core/app-address.js';
import { getInitialAppView, buildAppViewUrl } from '../src/core/app-routing-state.js';

const now = new Date(2026, 9, 12);
const show = (href, base = 'https://pyw31337.github.io/calendar/app/cw/') => toDisplayUrl(href, base, { now });

test('the reported mixed address becomes one calendar and one short page path', () => {
  const reported = 'https://pyw31337.github.io/calendar/app/jhair/?shell=v2&_update=1791758505677-xhcszz&year=2026&month=11&id=cw&tab=records&sub=content';
  assert.equal(show(reported, reported), '/calendar/app/cw/content/');
});

test('every page has its own short path and reads back as the same page', () => {
  const pages = {
    chat: 'chat', settlement: 'settlement', memo: 'memo', places: 'places',
    gallery: 'gallery', content: 'content', history: 'archive',
  };
  for (const [view, slug] of Object.entries(pages)) {
    const address = buildAppViewUrl({ pathname: '/calendar/app/cw/', search: '' }, view, now);
    assert.equal(address, `/calendar/app/cw/${slug}/`, view);
    assert.equal(getInitialAppView({ pathname: address, search: '' }), view, `${address} reopens ${view}`);
  }
  assert.equal(buildAppViewUrl({ pathname: '/calendar/app/cw/content/', search: '?historyTab=x' }, 'calendar', now), '/calendar/app/cw/?historyTab=x');
  assert.deepEqual([...APP_PAGE_SLUGS].sort(), ['archive', 'chat', 'content', 'gallery', 'memo', 'more', 'places', 'search', 'settlement']);
});

test('the calendar id is only ever in the path', () => {
  assert.equal(show('/calendar/app/cw/chat/?id=cw&cal=cw&msg=m1'), '/calendar/app/cw/chat/?msg=m1');
  // A deliberate switch (?id= naming another calendar) moves into the path; it is not appended.
  assert.equal(show('/calendar/app/jhair/memo/?id=cw'), '/calendar/app/cw/memo/');
  assert.equal(parseAppPath('/calendar/app/cw/content/').calendarId, 'cw');
  assert.equal(parseAppPath('/calendar/app/cw/unknown/'), null);
});

test('month stays only on the calendar page and only when it is not this month', () => {
  assert.equal(show('/calendar/app/cw/?year=2026&month=11'), '/calendar/app/cw/?month=2026-11');
  assert.equal(show('/calendar/app/cw/?year=2026&month=10'), '/calendar/app/cw/');
  assert.equal(show('/calendar/app/cw/content/?year=2026&month=11'), '/calendar/app/cw/content/');
  assert.deepEqual(readAddressMonth({ search: '?month=2026-11' }), { year: 2026, month: 11 });
  assert.deepEqual(readAddressMonth({ search: '?year=2026&month=03' }), { year: 2026, month: 3 });
  assert.equal(readAddressMonth({ search: '?month=2026-13' }), null);
});

test('tab/sub/view still route internally from a short path', () => {
  assert.equal(routeSearchParams({ pathname: '/calendar/app/cw/gallery/', search: '?img=a1' }).toString(), 'img=a1&tab=records&sub=media');
  assert.equal(routeSearchParams({ pathname: '/calendar/app/cw/', search: '' }).toString(), '');
  // An explicit query (an old link) wins over the path until the address is tidied.
  assert.equal(routeSearchParams({ pathname: '/calendar/app/cw/gallery/', search: '?tab=chat' }).get('tab'), 'chat');
  assert.equal(pageFromParams(new URLSearchParams('tab=records')), 'calendar');
  assert.equal(pageFromParams(new URLSearchParams('view=admin')), null);
});

test('admin, root and other-origin addresses keep their query apart from shell/_update', () => {
  assert.equal(show('/calendar/app/cw/?admin=1&cal=jhair&shell=v2'), '/calendar/app/cw/?admin=1&cal=jhair');
  assert.equal(show('/calendar/?id=cw&tab=records&sub=content&_update=1'), '/calendar/?id=cw&tab=records&sub=content');
  assert.equal(show('/calendar/?id=cw&tab=calendar'), '/calendar/?id=cw');
  assert.equal(show('https://other.test/x?shell=v2'), 'https://other.test/x?shell=v2');
  assert.equal(displayAddress({ pathname: '/calendar/app/cw/', search: '?view=admin' }), '/calendar/app/cw/?view=admin');
});

test('installCanonicalAddress tidies the open address and every later history write', () => {
  const writes = [];
  const win = {
    location: { href: 'https://x.test/calendar/app/cw/?shell=v2&id=cw&tab=records&sub=content' },
    history: {
      state: { keep: 1 },
      pushState(state, title, url) { writes.push(['push', url]); if (url != null) win.location.href = new URL(url, win.location.href).href; },
      replaceState(state, title, url) { writes.push(['replace', url]); if (url != null) win.location.href = new URL(url, win.location.href).href; },
    },
  };
  installCanonicalAddress(win);
  installCanonicalAddress(win);
  assert.deepEqual(writes, [['replace', '/calendar/app/cw/content/']]);
  win.history.pushState({}, '', '/calendar/app/cw/content/?tab=chat&msg=m1');
  win.history.replaceState({}, '');
  // A state-only write (no address) passes through untouched.
  assert.deepEqual(writes.slice(1), [['push', '/calendar/app/cw/chat/?msg=m1'], ['replace', undefined]]);
});

test('the build, 404 page, boot script and service worker know the page paths', () => {
  const copy = readFileSync(new URL('../scripts/copy-static-to-dist.mjs', import.meta.url), 'utf8');
  assert.match(copy, /import \{ APP_PAGE_SLUGS \} from '\.\.\/src\/core\/app-address\.js'/);
  assert.match(copy, /<base href="\.\.\/\.\.\/\.\.\/" \/>/);
  for (const file of ['../404.html', '../public-vite/404.html']) {
    const page = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(page, /app\\\/\(\[A-Za-z0-9_-\]\+\)\\\/\.\+\$/, `${file} sends an unknown page back to its calendar`);
  }
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  assert.match(html, /var APP_PATH_RE = \/\\\/app\\\/\(\[A-Za-z0-9_-\]\+\)\(\?:\\\/\[a-z\]\+\)\?\\\/\?\$\//);
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(sw, /\\\/app\\\/\(\[A-Za-z0-9_-\]\+\)\(\?:\\\/\[a-z\]\+\)\?\\\/\?\$/);
  const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
  assert.match(main, /installCanonicalAddress\(window\);/);
});

test('moved address helpers keep their old behaviour', async () => {
  const { calendarSwitchAddress, readSharedContentFromHash } = await import('../src/core/app-address.js');
  const { buildMonthUrl } = await import('../src/core/app-routing-state.js');
  assert.equal(calendarSwitchAddress('cw', { pathname: '/calendar/app/jhair/content/', search: '?historyTab=x' }), '/calendar/app/cw/content/');
  assert.equal(calendarSwitchAddress('cw', { pathname: '/calendar/app/jhair/chat/', search: '?msg=m1' }), '/calendar/app/cw/chat/');
  assert.equal(calendarSwitchAddress('cw', { pathname: '/calendar/', search: '?id=jhair' }), null);
  const month = buildMonthUrl({ pathname: '/calendar/app/cw/', search: '' }, new Date(2030, 0, 5));
  assert.equal(month, '/calendar/app/cw/?month=2030-01');
  assert.equal(buildMonthUrl({ pathname: '/calendar/share/cw/', search: '?id=cw' }, new Date(2030, 0, 5)), '/calendar/share/cw/?year=2030&month=01');
  assert.equal(buildMonthUrl({ pathname: '/calendar/', search: '?id=cw' }, new Date('x')), null);
  const item = { title: '전시', id: 'c1' };
  const hash = `#gatherContent=${Buffer.from(JSON.stringify({ kind: 'gather-content', item }), 'utf8').toString('base64')}`;
  assert.deepEqual(readSharedContentFromHash(hash), item);
  assert.equal(readSharedContentFromHash('#other'), null);
  assert.equal(readSharedContentFromHash('#gatherContent=%%%'), null);
});
