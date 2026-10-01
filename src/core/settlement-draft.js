/**
 * 모임 확정 → 정산 초안. When a meeting is confirmed the app offers "정산 만들기" in the toast; this
 * builds the card the settlement editor (CreateSettlementModal) opens with, so nobody re-picks
 * the people and expenses by hand. Nothing is saved until the editor's 생성 button.
 *
 *   - participants: who marked that date available (calendar.availabilities), else everyone active
 *   - expenses: every expense already logged on that date, pre-checked (same itemKey the editor uses)
 *   - title: "<M.D> <meeting note> 정산"
 * Pure: unit-tested in test/settlement-draft.test.mjs.
 */
const isLive = item => item && !item.deletedAt && !item.removedAt;

export function buildSettlementDraftFromMeeting(meeting, calendar) {
  const date = String(meeting?.date || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const participants = (Array.isArray(calendar?.participants) ? calendar.participants : []).filter(isLive);
  const nameById = new Map(participants.map(p => [p.id, p.name]));
  const attending = Array.from(new Set((Array.isArray(calendar?.availabilities) ? calendar.availabilities : [])
    .filter(a => isLive(a) && String(a.date || '').slice(0, 10) === date)
    .map(a => nameById.get(a.participantId))
    .filter(Boolean)));
  const names = attending.length ? attending : participants.map(p => p.name).filter(Boolean);
  const stamp = Date.now();
  const expenses = (Array.isArray(meeting?.expenses) ? meeting.expenses : []).filter(isLive);
  const [, month, day] = date.split('-').map(Number);
  const note = String(meeting?.note || '').trim().split(/\s+/).slice(0, 4).join(' ');
  return {
    isDraft: true,
    title: `${month}.${day}${note ? ` ${note}` : ''} 정산`.slice(0, 60),
    monthStr: date.slice(0, 7),
    participants: names,
    participantRows: names.map((name, index) => ({ id: `pr_${index}_${stamp}`, participantId: name, memo: '' })),
    checkedItemKeys: expenses.map((exp, index) => `${date}_${exp.id || index}_${exp.amount || 0}`),
  };
}
