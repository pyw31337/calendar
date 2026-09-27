import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis.window || {};
globalThis.window.GATHER_APP_UTILS = {
  ...(globalThis.window.GATHER_APP_UTILS || {}),
  normalizeDateString(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? match[0] : '';
  },
};

const { getNextConfirmedMeeting } = await import('../src/core/app-domain-helpers.js');

test('side-navigation D-day selects the nearest non-past confirmed meeting', () => {
  const calendar = {
    confirmedMeeting: [
      { date: '2026-09-25', confirmed: true },
      { date: '2026-09-28', confirmed: false },
      { date: '2026-10-04', confirmed: true },
      { date: '2026-09-30', confirmed: true },
    ],
  };

  assert.equal(getNextConfirmedMeeting(calendar, new Date(2026, 8, 27, 12))?.date, '2026-09-30');
});

test('side-navigation D-day includes today but hides when only past meetings remain', () => {
  const today = new Date(2026, 8, 27, 12);
  assert.equal(getNextConfirmedMeeting({ confirmedMeeting: [{ date: '2026-09-27', confirmed: true }] }, today)?.date, '2026-09-27');
  assert.equal(getNextConfirmedMeeting({ confirmedMeeting: [{ date: '2026-09-26', confirmed: true }] }, today), null);
});
