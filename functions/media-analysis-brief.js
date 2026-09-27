'use strict';

const ACTION_URL = 'https://pyw31337.github.io/calendar/?shell=v2&tab=gallery';

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function summaryValue(summary, key) {
  return Math.max(0, number(summary?.[key]));
}

function makeText(brief) {
  const lines = [
    `모아엘가 AI 분석 브리핑 · ${brief.dateLabel}`,
    `분석 추천 ${brief.total.suggested}건 · 오류 ${brief.total.failed}건 · 활성 캘린더 ${brief.calendars.length}개`,
    ''
  ];
  for (const calendar of brief.calendars) {
    lines.push(`${calendar.name}: 추천 ${calendar.summary.suggested}건, 오류 ${calendar.summary.failed}건, 상태 ${calendar.healthLabel}`);
  }
  if (brief.total.failed || brief.staleCount) {
    lines.push('', '확인이 필요한 항목');
    if (brief.total.failed) lines.push(`- 분석하지 못한 사진 ${brief.total.failed}건: 라이브 웹의 갤러리 > AI 분석에서 오류를 확인하세요.`);
    if (brief.staleCount) lines.push(`- 생존 신호가 오래된 워커 ${brief.staleCount}개: 로컬 Mac의 launchd 작업과 네트워크를 확인하세요.`);
  }
  lines.push('', `라이브 검토: ${ACTION_URL}`);
  return lines.join('\n');
}

function statusColor(calendar) {
  if (calendar.stale || calendar.summary.failed) return '#dc2626';
  if (calendar.summary.suggested) return '#6d28d9';
  return '#64748b';
}

function renderCalendarRow(calendar) {
  const color = statusColor(calendar);
  const detail = calendar.stale
    ? 'Mac 워커 생존 신호를 확인하세요'
    : calendar.summary.failed
      ? `재시도·검토 필요 ${calendar.summary.failed}건`
      : calendar.summary.suggested
        ? `새 추천 ${calendar.summary.suggested}건`
        : '새로 분석할 사진 없음';
  return `<tr>
    <td style="padding:16px 0;border-bottom:1px solid #e8e7f2;vertical-align:top;">
      <div style="font-size:15px;font-weight:800;color:#16162a;">${escapeHtml(calendar.name)}</div>
      <div style="margin-top:4px;font-size:12px;line-height:18px;color:#64748b;">${escapeHtml(detail)}</div>
    </td>
    <td style="padding:16px 0;border-bottom:1px solid #e8e7f2;vertical-align:top;text-align:right;white-space:nowrap;">
      <span style="display:inline-block;padding:5px 9px;border-radius:999px;background:${color}14;color:${color};font-size:12px;font-weight:800;">${escapeHtml(calendar.healthLabel)}</span>
      <div style="margin-top:8px;font-size:12px;color:#64748b;">인물 ${calendar.summary.withPeople} · 장소 ${calendar.summary.withPlaces} · 일정 ${calendar.summary.withMeetings}</div>
    </td>
  </tr>`;
}

function renderActionBox(brief) {
  if (!brief.total.failed && !brief.staleCount) {
    return `<div style="margin-top:24px;padding:16px 18px;border-radius:14px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-size:13px;line-height:20px;">
      <strong>정상 처리 중입니다.</strong> 자동 적용은 하지 않았으며, 추천은 라이브 웹에서 검토 후 반영할 수 있습니다.
    </div>`;
  }
  const actions = [];
  if (brief.total.failed) actions.push('오류 사진은 갤러리 → AI 분석에서 확인한 뒤 다시 처리할 수 있습니다. 실패 이력은 서버에 남아 있습니다.');
  if (brief.staleCount) actions.push('생존 신호가 오래된 경우, Mac의 네트워크·전원과 launchd 작업을 확인하세요. 다음 15분 주기에 자동 재시도를 시도합니다.');
  return `<div style="margin-top:24px;padding:16px 18px;border-radius:14px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:13px;line-height:20px;">
    <strong>확인이 필요한 항목이 있습니다.</strong><br>${escapeHtml(actions.join(' '))}
  </div>`;
}

function renderHtml(brief) {
  const rows = brief.calendars.map(renderCalendarRow).join('') || '<tr><td style="padding:20px 0;color:#64748b;">아직 수집된 분석 기록이 없습니다.</td></tr>';
  return `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f5fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#16162a;">
  <span style="display:none!important;visibility:hidden;mso-hide:all;">새 추천 ${brief.total.suggested}건, 확인 필요 ${brief.total.failed + brief.staleCount}건</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background:#f5f5fb;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 12px 32px rgba(39,24,96,.10);">
      <tr><td style="padding:30px 30px 28px;background:linear-gradient(125deg,#5520da 0%,#7c3aed 52%,#d6298b 100%);color:#fff;">
        <div style="font-size:12px;font-weight:800;letter-spacing:.08em;opacity:.8;">MOYEORA CALENDAR</div>
        <div style="margin-top:10px;font-size:25px;line-height:32px;font-weight:900;">AI 분석 브리핑</div>
        <div style="margin-top:7px;font-size:14px;opacity:.9;">${escapeHtml(brief.dateLabel)} · 서버에 누적된 분석 결과</div>
      </td></tr>
      <tr><td style="padding:26px 30px 30px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
          <td style="width:33.33%;padding-right:8px;"><div style="padding:15px 12px;border-radius:14px;background:#f5f3ff;"><div style="font-size:11px;color:#6b7280;">새 추천</div><div style="margin-top:5px;font-size:22px;font-weight:900;color:#6d28d9;">${brief.total.suggested}</div></div></td>
          <td style="width:33.33%;padding:0 4px;"><div style="padding:15px 12px;border-radius:14px;background:#eff6ff;"><div style="font-size:11px;color:#6b7280;">분석 사진</div><div style="margin-top:5px;font-size:22px;font-weight:900;color:#2563eb;">${brief.total.received}</div></div></td>
          <td style="width:33.33%;padding-left:8px;"><div style="padding:15px 12px;border-radius:14px;background:${brief.total.failed || brief.staleCount ? '#fff1f2' : '#f0fdf4'};"><div style="font-size:11px;color:#6b7280;">확인 필요</div><div style="margin-top:5px;font-size:22px;font-weight:900;color:${brief.total.failed || brief.staleCount ? '#dc2626' : '#16a34a'};">${brief.total.failed + brief.staleCount}</div></div></td>
        </tr></table>
        <div style="margin-top:28px;font-size:16px;font-weight:900;">캘린더별 현황</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:4px;">${rows}</table>
        ${renderActionBox(brief)}
        <a href="${ACTION_URL}" style="display:block;margin-top:24px;padding:14px 18px;border-radius:12px;background:#17172d;color:#fff;text-align:center;text-decoration:none;font-size:14px;font-weight:800;">라이브 웹에서 분석 검토하기</a>
      </td></tr>
      <tr><td style="padding:17px 30px;background:#fafafd;color:#8a8aa0;font-size:11px;line-height:17px;">이 메일은 평일 오전 8시(KST) 기준 서버에 누적된 분석 결과입니다. 사진 원본·댓글·사용자 태그는 자동으로 변경되지 않습니다.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function buildBrief({ dateLabel, calendars = [] } = {}) {
  const normalized = calendars.map(calendar => {
    const summary = calendar.summary || {};
    return {
      name: String(calendar.name || calendar.id || '캘린더'),
      summary: {
        received: summaryValue(summary, 'received'),
        suggested: summaryValue(summary, 'suggested'),
        failed: summaryValue(summary, 'failed'),
        withPeople: summaryValue(summary, 'withPeople'),
        withPlaces: summaryValue(summary, 'withPlaces'),
        withMeetings: summaryValue(summary, 'withMeetings')
      },
      stale: Boolean(calendar.stale),
      healthLabel: calendar.stale ? '생존 신호 확인' : String(calendar.healthLabel || '정상')
    };
  });
  const total = normalized.reduce((accumulator, calendar) => {
    for (const key of Object.keys(accumulator)) accumulator[key] += calendar.summary[key] || 0;
    return accumulator;
  }, { received: 0, suggested: 0, failed: 0, withPeople: 0, withPlaces: 0, withMeetings: 0 });
  const brief = {
    dateLabel: String(dateLabel || ''),
    calendars: normalized,
    total,
    staleCount: normalized.filter(calendar => calendar.stale).length
  };
  return { ...brief, subject: `모아엘가 AI 분석 브리핑 · ${brief.dateLabel}`, text: makeText(brief), html: renderHtml(brief) };
}

module.exports = { ACTION_URL, buildBrief };
