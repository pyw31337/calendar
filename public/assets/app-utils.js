(function () {
  const DAY_NAMES_KO = ['일', '월', '화', '수', '목', '금', '토'];

  function getContrastTextColor(hexColor) {
    if (!hexColor) return '#FFFFFF';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? '#0F172A' : '#FFFFFF';
  }

  function formatDateWithDayName(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parts[0];
      const m = parts[1];
      const d = parts[2];
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      if (!isNaN(dateObj.getTime())) {
        const dayName = DAY_NAMES_KO[dateObj.getDay()];
        return `${y}.${m}.${d} (${dayName})`;
      }
    }
    return dateStr;
  }

  function formatShortDateWithDayName(dateStr) {
    const formatted = formatDateWithDayName(dateStr);
    return formatted.replace(/^(\d{2})(\d{2})\./, '$2.');
  }

  function formatConfirmedMeetingLabel(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayName = DAY_NAMES_KO[dateObj.getDay()];
    return `[모임확정] ${y.slice(2)}.${m}.${d} (${dayName})`;
  }

  function formatDDayLabel(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((target - today) / 86400000);
    return diffDays <= 0 ? 'D-DAY' : `D-${diffDays}`;
  }

  window.GATHER_APP_UTILS = Object.freeze({
    getContrastTextColor,
    formatDateWithDayName,
    formatShortDateWithDayName,
    formatConfirmedMeetingLabel,
    formatDDayLabel
  });
})();
