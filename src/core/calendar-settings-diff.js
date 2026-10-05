/**
 * Only send calendar settings fields the user actually changed.
 * Always including expenseCategories/placeCategories from a stale form snapshot was resetting
 * categories edited elsewhere (the "jhair/kkot 분류 reset" class of bugs).
 */

const DEFAULT_CANDIDATES = [
  'title',
  'description',
  'accentColor',
  'participants',
  'expenseCategories',
  'placeCategories',
  'settlementBaseBudget',
  'settlementCards',
  'places',
  'confirmedMeeting',
  'weatherLocation',
  'recentLocations',
  'pinnedNotices',
  'pinnedNotice',
  'customPersonTags',
];

function stableJson(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch (_) {
    return String(value);
  }
}

/** Return the subset of `candidates` whose values differ between baseline and next. */
export function diffCalendarSettingsFields(baseline = {}, next = {}, candidates = DEFAULT_CANDIDATES) {
  const fields = [];
  for (const key of candidates) {
    if (!Object.prototype.hasOwnProperty.call(next, key) && !Object.prototype.hasOwnProperty.call(baseline, key)) continue;
    if (stableJson(baseline?.[key]) !== stableJson(next?.[key])) fields.push(key);
  }
  return fields;
}

/**
 * Merge category lists by id (like mergePlaces): incoming wins on same id when newer/present,
 * server-only ids are kept, so a stale partial list cannot wipe categories added elsewhere.
 * `deletedIds` removes ids the user explicitly removed in this save.
 */
export function mergeCategoriesById(serverList = [], incomingList = [], deletedIds = []) {
  const byId = new Map();
  (Array.isArray(serverList) ? serverList : []).forEach(cat => {
    if (cat?.id) byId.set(String(cat.id), cat);
  });
  (Array.isArray(incomingList) ? incomingList : []).forEach(cat => {
    if (!cat?.id) return;
    byId.set(String(cat.id), cat);
  });
  (Array.isArray(deletedIds) ? deletedIds : []).forEach(id => {
    if (id) byId.delete(String(id));
  });
  return Array.from(byId.values());
}

export { DEFAULT_CANDIDATES as CALENDAR_SETTINGS_DIFF_CANDIDATES };
