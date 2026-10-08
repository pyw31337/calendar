import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// "대체공휴일(개천절)" must break only as "대체공휴일 / (개천절)" in every browser (WebKit broke it
// as "대체공휴일( / 개천절)" when it relied on keep-all + <wbr> inside one text run).
const shell = fs.readFileSync('src/ui/ui-app-shell-v2.js', 'utf8');
const css = fs.readFileSync('src/ui/v2/dest-chrome-late.css', 'utf8');

test('the label renders two unbreakable halves with the only break before "("', () => {
  const fn = shell.slice(shell.indexOf('function withBreakBeforeParen'), shell.indexOf('function anniversaryBarPaint'));
  assert.match(fn, /createElement\('span', \{ key: 'main', className: bentoClass\('day-corner-seg'\) \}, parts\[0\]\)/);
  assert.match(fn, /createElement\('wbr', \{ key: 'wbr' \}\)/);
  assert.match(fn, /createElement\('span', \{ key: 'paren', className: bentoClass\('day-corner-seg'\) \}, parts\[1\]\)/);
  assert.match(shell, /day-corner-label \$\{isHolidayCorner \? 'is-holiday' : ''\} \$\{splitCornerLabel\(cornerLabel\) \? 'has-paren' : ''\}/);
});

test('each half is nowrap inline-block and phones shrink the type to fit the longer half', () => {
  assert.match(css, /\.bp-day-corner-label \.bp-day-corner-seg \{\s*display: inline-block !important;\s*white-space: nowrap !important;/);
  assert.match(css, /\.bp-day-corner-label\.bp-has-paren \{\s*font-size: min\(0\.6rem, calc\(\(100vw - 22px\) \/ 7 \/ \(var\(--corner-chars, 5\) \+ 0\.3\)\)\) !important;/);
});

test('split helper sizes by the longer half', async () => {
  const src = shell.slice(shell.indexOf('const CORNER_NARROW_CHAR'), shell.indexOf('function withBreakBeforeParen'));
  const mod = new Function(`${src}; return { splitCornerLabel, cornerLabelProps };`)();
  assert.deepEqual(mod.splitCornerLabel('대체공휴일(개천절)'), ['대체공휴일', '(개천절)']);
  assert.equal(mod.splitCornerLabel('한글날'), null);
  assert.equal(mod.cornerLabelProps('대체공휴일(개천절)').style['--corner-chars'], '5');
  assert.deepEqual(mod.cornerLabelProps('추석 연휴'), {});
});
