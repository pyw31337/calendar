import { POLL_ACTIVITY_ACTIONS } from './app-domain-helpers.js';

const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};

// Rebuilds a calendar's state as of a past timestamp T by replaying its activity log forward
// from scratch, rather than trying to undo individual mutations in reverse -- undo-in-reverse
// breaks the moment two log entries touch the same field out of order, while replay-from-scratch
// is correct by construction as long as every log entry captures enough of its own before/after
// state. Used by the admin "복구" (restore) flow to preview/apply a point-in-time rollback.
export const rebuildCalendarToTimestamp = (calendar, T, logs = []) => {
  const now = Date.now();

  // Sort chronologically
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);

  // 1. Rebuild participants (only kept if created before T, un-removed if deleted after T)
  const rebuiltParticipants = (calendar.participants || [])
    .filter(p => (p.updatedAt || 0) <= T)
    .map(p => {
      if (p.removedAt && p.removedAt > T) {
        const { removedAt: _removedAt, ...rest } = p;
        return rest;
      }
      return p;
    });

  const participantIds = new Set(rebuiltParticipants.map(p => p.id));
  const BULK_NO_PARTICIPANT_ID = (GATHER_APP_CONSTANTS && GATHER_APP_CONSTANTS.BULK_NO_PARTICIPANT_ID) || '__none__';

  // 2. Rebuild availabilities
  const rebuiltAvailabilities = new Map();
  for (const log of sortedLogs) {
    if (log.timestamp > T) continue;
    if (POLL_ACTIVITY_ACTIONS.includes(log.action)) continue;
    if (log.participantId && log.participantId !== BULK_NO_PARTICIPANT_ID && !participantIds.has(log.participantId)) continue;

    const key = `${log.date}_${log.participantId}`;
    if (log.action === 'create' || log.action === 'update') {
      rebuiltAvailabilities.set(key, {
        date: log.date,
        participantId: log.participantId,
        note: log.note || '',
        updatedAt: log.timestamp
      });
    } else if (log.action === 'delete') {
      rebuiltAvailabilities.delete(key);
    }
  }

  // 3. Rebuild Polls and Votes
  const rebuiltPolls = (calendar.polls || [])
    .filter(poll => (poll.createdAt || 0) <= T)
    .map(poll => {
      const votes = {};
      const optionMap = (poll.options || []).reduce((acc, opt) => {
        acc[opt.text] = opt.id;
        return acc;
      }, {});

      for (const log of sortedLogs) {
        if (log.timestamp > T) continue;
        if (!participantIds.has(log.participantId)) continue;

        if (log.action === 'poll_vote' && log.note.startsWith(`${poll.title} / `)) {
          const optText = log.note.substring(poll.title.length + 3);
          const optId = optionMap[optText];
          if (optId) votes[log.participantId] = optId;
        } else if (log.action === 'poll_cancel' && log.note.startsWith(`${poll.title} / `)) {
          delete votes[log.participantId];
        }
      }
      return { ...poll, votes, updatedAt: T };
    });

  // 4. Rebuild Confirmed Meetings and Expenses
  const rebuiltMeetingsMap = new Map();
  (calendar.confirmedMeeting || []).forEach(m => {
    if (!m) return;
    const expenses = (m.expenses || []).filter(e => (e.createdAt || 0) <= T);
    const isConfirmed = m.confirmed !== false && (m.confirmedAt || 0) <= T;
    rebuiltMeetingsMap.set(m.date, {
      ...m,
      confirmed: isConfirmed,
      confirmedAt: isConfirmed ? m.confirmedAt : null,
      expenses: expenses
    });
  });

  for (const log of sortedLogs) {
    if (log.timestamp > T) continue;
    const dateStr = log.date;
    if (!dateStr) continue;

    if (log.action === 'meeting_confirm') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      rebuiltMeetingsMap.set(dateStr, {
        ...existing,
        confirmed: true,
        confirmedAt: log.timestamp,
        note: log.note
      });
    } else if (log.action === 'meeting_cancel') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      rebuiltMeetingsMap.set(dateStr, {
        ...existing,
        confirmed: false,
        confirmedAt: null
      });
    } else if (log.action === 'expense_create' || log.action === 'expense_update') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      const match = /^([+-])([\d,]+)원\s*(.*)$/.exec(log.note);
      if (match) {
        const sign = match[1];
        const amountVal = Number(match[2].replace(/,/g, ''));
        const amount = sign === '+' ? -amountVal : amountVal;
        const label = match[3] || '';
        const expId = `rebuilt_exp_${log.id}`;
        const categoryId = 'etc';

        if (log.action === 'expense_create') {
          existing.expenses.push({
            id: expId,
            label,
            url: '',
            categoryId,
            amount,
            createdAt: log.timestamp,
            updatedAt: log.timestamp
          });
        } else {
          const idx = existing.expenses.findIndex(e => e.label === label);
          if (idx >= 0) {
            existing.expenses[idx] = {
              ...existing.expenses[idx],
              amount,
              updatedAt: log.timestamp
            };
          } else {
            existing.expenses.push({
              id: expId,
              label,
              url: '',
              categoryId,
              amount,
              createdAt: log.timestamp,
              updatedAt: log.timestamp
            });
          }
        }
      }
      rebuiltMeetingsMap.set(dateStr, existing);
    } else if (log.action === 'expense_delete') {
      const existing = rebuiltMeetingsMap.get(dateStr) || { date: dateStr, expenses: [] };
      const match = /^([+-])([\d,]+)원\s*(.*)$/.exec(log.note);
      if (match) {
        const label = match[3] || '';
        existing.expenses = existing.expenses.filter(e => e.label !== label);
      }
      rebuiltMeetingsMap.set(dateStr, existing);
    }
  }

  const rebuiltLogs = logs.filter(log => log.timestamp <= T);

  return {
    ...calendar,
    participants: rebuiltParticipants,
    availabilities: Array.from(rebuiltAvailabilities.values()),
    polls: rebuiltPolls,
    confirmedMeeting: Array.from(rebuiltMeetingsMap.values()).filter(m => m.confirmed !== false || m.expenses.length > 0 || (Array.isArray(m.photos) && m.photos.length > 0)),
    activityLogs: rebuiltLogs,
    updatedAt: now,
    revision: (calendar.revision || 0) + 1
  };
};
