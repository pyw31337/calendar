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

  function formatRegisteredAt(timestamp) {
    const value = Number(timestamp || 0);
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}.${month}.${day} (${DAY_NAMES_KO[date.getDay()]}) ${hours}:${minutes}:${seconds}`;
  }

  function formatCommentDate(timestamp) {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return {
      dateStr: `${month}.${day}(${DAY_NAMES_KO[date.getDay()]})`,
      timeStr: `${hours}:${minutes}:${seconds}`
    };
  }

  function formatChatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function formatChatDividerDate(timestamp) {
    const date = new Date(timestamp);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}(${DAY_NAMES_KO[date.getDay()]})`;
  }

  function formatBytes(bytes) {
    const value = Number(bytes);
    if (!isFinite(value) || value < 0) return null;
    if (value >= 1024 * 1024 * 1024) return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
    if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
    if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${value} B`;
  }

  function stripUrlEdgePunctuation(value = '') {
    return String(value || '').replace(/[\s"'“”‘’`)\].,!?]+$/g, '');
  }

  function extractFirstUrlInfo(value = '') {
    const source = String(value || '');
    const markdownMatch = source.match(/\[[^\]]*]\(((?:https?:\/\/|www\.)[^)\s]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^)\s]*)?)\)/i);
    if (markdownMatch) {
      const raw = markdownMatch[0];
      const href = stripUrlEdgePunctuation(markdownMatch[1]);
      const url = /^https?:\/\//i.test(href) ? href : `https://${href}`;
      return { raw, url };
    }
    const match = source.match(/(?:https?:\/\/|www\.)[^\s)\]]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)\]]*)?/i);
    if (!match) return { raw: '', url: '' };
    const raw = stripUrlEdgePunctuation(match[0]);
    if (!raw || !/[a-z0-9]/i.test(raw)) return { raw: '', url: '' };
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return { raw, url };
  }

  function extractFirstUrl(value = '') {
    return extractFirstUrlInfo(value).url;
  }

  function removeFirstUrl(value = '') {
    const source = String(value || '');
    const { raw } = extractFirstUrlInfo(source);
    return raw ? source.replace(raw, '').trim() : source.trim();
  }

  window.GATHER_APP_UTILS = Object.freeze({
    getContrastTextColor,
    formatDateWithDayName,
    formatShortDateWithDayName,
    formatConfirmedMeetingLabel,
    formatDDayLabel,
    formatRegisteredAt,
    formatCommentDate,
    formatChatTime,
    formatChatDividerDate,
    formatBytes,
    stripUrlEdgePunctuation,
    extractFirstUrlInfo,
    extractFirstUrl,
    removeFirstUrl
  });
})();
