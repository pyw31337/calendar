(function () {
  const PRESET_COLORS = Object.freeze([
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6'
  ]);

  const DEFAULT_EXPENSE_CATEGORIES = Object.freeze([
    Object.freeze({ id: 'food', name: '식품', color: '#F97316' }),
    Object.freeze({ id: 'goods', name: '물품', color: '#3B82F6' }),
    Object.freeze({ id: 'transport', name: '교통', color: '#10B981' }),
    Object.freeze({ id: 'lodging', name: '숙박', color: '#8B5CF6' }),
    Object.freeze({ id: 'culture', name: '문화', color: '#EC4899' }),
    Object.freeze({ id: 'etc', name: '기타', color: '#64748B' })
  ]);

  const EXPENSE_CATEGORY_ICONS = Object.freeze({
    food: '🍜',
    goods: '🧸',
    transport: '🚎',
    lodging: '🏨',
    culture: '🎟️',
    etc: '💬'
  });

  const SCHEDULE_ACTIVITY_ACTIONS = Object.freeze(['create', 'update', 'delete']);
  const POLL_ACTIVITY_ACTIONS = Object.freeze(['poll_create', 'poll_vote', 'poll_cancel']);
  const EXPENSE_ACTIVITY_ACTIONS = Object.freeze(['expense_create', 'expense_update', 'expense_delete']);
  const IMAGE_TAG_ACTIVITY_ACTIONS = Object.freeze(['tag_add', 'tag_remove']);
  const MEETING_ACTIVITY_ACTIONS = Object.freeze(['meeting_confirm', 'meeting_cancel']);
  const MEMO_ACTIVITY_ACTIONS = Object.freeze(['memo_create', 'memo_update', 'memo_delete']);
  const CALENDAR_ACCENT_PALETTE = Object.freeze(['#F97316', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#F59E0B']);

  window.GATHER_APP_CONSTANTS = Object.freeze({
    PRESET_COLORS,
    DEFAULT_EXPENSE_CATEGORIES,
    EXPENSE_CATEGORY_ICONS,
    SCHEDULE_ACTIVITY_ACTIONS,
    POLL_ACTIVITY_ACTIONS,
    EXPENSE_ACTIVITY_ACTIONS,
    IMAGE_TAG_ACTIVITY_ACTIONS,
    MEETING_ACTIVITY_ACTIONS,
    MEMO_ACTIVITY_ACTIONS,
    CALENDAR_ACCENT_PALETTE
  });
})();
