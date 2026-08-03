import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { getContrastTextColor } from '../utils/colors';

function formatDateWithDayName(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (!isNaN(dateObj.getTime())) {
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const dayName = dayNames[dateObj.getDay()];
      return `${y}.${m}.${d} (${dayName})`;
    }
  }
  return dateStr;
}

export default function AvailableDatesList({ calendar, onSelectDate }) {
  if (!calendar) return null;

  const participants = calendar.participants || [];
  const totalCount = participants.length;
  const availabilities = calendar.availabilities || [];

  const participantsMap = participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const dateMap = availabilities.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const fullMatchDates = [];

  Object.entries(dateMap).forEach(([dateStr, entries]) => {
    const validEntries = entries.filter(e => participantsMap[e.participantId]);
    const uniqueParticipants = new Set(validEntries.map(e => e.participantId));
    const availCount = uniqueParticipants.size;

    if (totalCount > 0 && availCount === totalCount) {
      fullMatchDates.push({ dateStr, entries: validEntries, count: availCount });
    }
  });

  fullMatchDates.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  return (
    <div className="summary-card">
      <div className="summary-title">
        <CalendarCheck size={22} style={{ color: '#10B981' }} />
        <span>전원 참석 가능 날짜 리스트 ({fullMatchDates.length}일)</span>
      </div>

      {fullMatchDates.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          아직 참여자 전원이 가능한 날짜가 없습니다. 달력에서 날짜를 선택하여 가능 여부를 표기해보세요!
        </div>
      ) : (
        <div>
          {fullMatchDates.map(({ dateStr, entries, count }) => {
            const formatted = formatDateWithDayName(dateStr);
            const memoEntries = entries.filter(e => e.note && e.note.trim().length > 0);

            return (
              <button
                key={dateStr}
                className="date-item-btn"
                onClick={() => onSelectDate(dateStr)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, color: '#10B981', fontSize: '0.95rem' }}>
                    {formatted}
                  </span>

                  {/* Render Capsule Memo Badges ONLY for participants who typed a note */}
                  {memoEntries.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {memoEntries.map((e) => {
                        const p = participantsMap[e.participantId];
                        if (!p) return null;
                        const memoText = e.note.trim();
                        return (
                          <span
                            key={e.participantId || p.id}
                            className="memo-capsule-badge"
                            style={{
                              backgroundColor: p.color,
                              color: getContrastTextColor(p.color),
                              padding: '4px 12px',
                              fontSize: '0.8rem',
                              borderRadius: '9999px',
                              fontWeight: '700'
                            }}
                          >
                            {p.name}: {memoText}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  background: '#10B981',
                  color: '#FFF',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}>
                  전원 가능 ({count}/{totalCount}명)
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
