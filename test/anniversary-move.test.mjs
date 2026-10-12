import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {
  isMovableAnniversary,
  planAnniversaryMove,
  describeAnniversaryMove,
  withObjectParticle,
  withDirectionParticle
} from '../src/core/app-anniversary-move.js';

const formatDate = dateStr => {
  const [y, m, d] = dateStr.split('-');
  return `${y}.${m}.${d} (${'일월화수목금토'[new Date(Date.UTC(+y, +m - 1, +d)).getUTCDay()]})`;
};

test('one-day, yearly, 연일 and content-linked anniversaries can be dragged; rule-based ones cannot', () => {
  assert.equal(isMovableAnniversary({ type: 'once', date: '2026-10-07' }), true);
  assert.equal(isMovableAnniversary({ type: 'yearly', date: '10-01' }), true);
  assert.equal(isMovableAnniversary({ type: 'yearly', date: '09-08', isLunar: true }), true);
  assert.equal(isMovableAnniversary({ type: 'range', startDate: '2026-10-09', endDate: '2026-10-11' }), true);
  assert.equal(isMovableAnniversary({ type: 'range', startDate: '2026-10-09' }), false);
  assert.equal(isMovableAnniversary({ type: 'once', cultureSourceId: 'c1', category: 'event' }), true);
  assert.equal(isMovableAnniversary({ type: 'repeat', startDate: '2026-01-01' }), false);
  assert.equal(isMovableAnniversary({ type: 'dday', date: '2026-01-01' }), false);
  assert.equal(isMovableAnniversary(null), false);
});

test('a move changes only the date fields, and keeps the old values for 되돌리기', () => {
  const yearly = planAnniversaryMove({ type: 'yearly', date: '10-01' }, '2026-10-01', '2026-10-09');
  assert.deepEqual(yearly, { patch: { date: '10-09' }, previous: { date: '10-01' }, kind: 'yearly', lunar: false });

  const once = planAnniversaryMove({ type: 'once', date: '2026-10-07' }, '2026-10-07', '2026-10-10');
  assert.deepEqual(once.patch, { date: '2026-10-10' });

  // Dragging any day of a 연일 bar shifts the whole period by the same distance (across a month end too).
  const range = planAnniversaryMove({ type: 'range', startDate: '2026-10-30', endDate: '2026-11-01' }, '2026-10-31', '2026-11-08');
  assert.deepEqual(range.patch, { startDate: '2026-11-07', endDate: '2026-11-09' });
  assert.deepEqual(range.previous, { startDate: '2026-10-30', endDate: '2026-11-01' });

  // A lunar birthday keeps counting in lunar dates: solar 2026-10-26 is lunar 9/16.
  const lunar = planAnniversaryMove({ type: 'yearly', date: '09-08', isLunar: true }, '2026-10-18', '2026-10-26');
  assert.deepEqual(lunar.patch, { date: '09-16', isLeap: false });
  assert.equal(lunar.lunar, true);

  // A content-linked card only moves its reminder day; undo restores its old type.
  const culture = planAnniversaryMove({ type: 'range', startDate: '2026-10-01', endDate: '2026-10-05', cultureSourceId: 'c1', category: 'festival' }, '2026-10-03', '2026-10-20');
  assert.deepEqual(culture.patch, { type: 'once', date: '2026-10-20', isLunar: false, isLeap: false });
  assert.deepEqual(culture.previous, { type: 'range', date: null, isLunar: false, isLeap: false });

  assert.equal(planAnniversaryMove({ type: 'repeat' }, '2026-10-21', '2026-10-22'), null);
  assert.equal(planAnniversaryMove({ type: 'once', date: '2026-10-07' }, '2026-10-07', '2026-10-07'), null);
  assert.equal(planAnniversaryMove({ type: 'once', date: '2026-10-07' }, '2026-10-07', 'not-a-date'), null);
});

test('the confirm sentence uses the right Korean particles', () => {
  assert.equal(withObjectParticle('생일'), '생일을');
  assert.equal(withObjectParticle('연수'), '연수를');
  assert.equal(withObjectParticle('“[서울 구로]”'), '“[서울 구로]”를');
  assert.equal(withDirectionParticle('2026.10.10 (토)'), '2026.10.10 (토)로');
  assert.equal(withDirectionParticle('2026.10.11 (일)'), '2026.10.11 (일)로');
  assert.equal(withDirectionParticle('2026.10.09 (금)'), '2026.10.09 (금)으로');
  assert.equal(withDirectionParticle('ABC'), 'ABC(으)로');

  const ann = { type: 'once', date: '2026-10-07' };
  assert.equal(
    describeAnniversaryMove('학부모 참여수업 및 연수', '2026-10-07', '2026-10-10', planAnniversaryMove(ann, '2026-10-07', '2026-10-10'), formatDate),
    '“학부모 참여수업 및 연수”를 2026.10.07 (수)에서 2026.10.10 (토)로 옮기시겠습니까?'
  );
  const lunar = { type: 'yearly', date: '09-08', isLunar: true };
  assert.match(
    describeAnniversaryMove('김유리 생일', '2026-10-18', '2026-10-26', planAnniversaryMove(lunar, '2026-10-18', '2026-10-26'), formatDate),
    /음력 기념일이라 해마다 음력 9월 16일로 바뀝니다\.$/
  );
  const range = { type: 'range', startDate: '2026-10-09', endDate: '2026-10-11' };
  assert.match(
    describeAnniversaryMove('영월외룡캠핑장', '2026-10-09', '2026-10-17', planAnniversaryMove(range, '2026-10-09', '2026-10-17'), formatDate),
    /기간 전체를 2026\.10\.17 \(토\) ~ 2026\.10\.19 \(월\)로 옮깁니다\.$/
  );
});

test('movable anniversary badges are grabbable in the V2 calendar', async () => {
  const shell = await fs.readFile(new URL('../src/ui/ui-app-shell-v2.js', import.meta.url), 'utf8');
  assert.match(shell, /const movable = isMovableAnniversary\(bar\);/, '연일 bars use the shared movability rule');
  assert.match(shell, /const movableAnn = isMovableAnniversary\(ann\);/, 'one-day badges use the shared movability rule');
  // The bar stack and range bars ignore the pointer for taps; a movable badge has to opt back in,
  // and an :active style makes Chrome's touch adjustment pick the thin phone bar over a nearby dot.
  const design = await fs.readFile(new URL('../src/ui/v2/design.css', import.meta.url), 'utf8');
  assert.match(design, /\.bp-day-bar-stack \.bp-day-anniversary\.bp-is-draggable \{ pointer-events: auto; cursor: grab; \}/);
  assert.match(design, /\.bp-day-bar-stack \.bp-day-anniversary\.bp-is-draggable:active \{/);
  const late = await fs.readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8');
  assert.match(late, /\.bp-ann-range\.bp-is-draggable \{\n {2}pointer-events: auto !important;/);
  assert.match(late, /\.bp-ann-range\.bp-is-draggable:active \{/);
});
