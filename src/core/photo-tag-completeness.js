import { classifyExistingPhotoTags } from './photo-tag-identity.js';

function isDateTag(value) {
  let key = value;
  if (/^\d{6}$/.test(key)) key = '20' + key;
  if (!/^\d{8}$/.test(key)) return false;
  const iso = `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`;
  const date = new Date(iso + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso;
}

export function getPhotoTagCompleteness(tagsText, calendar, extras = null) {
  const extra = extras && typeof extras === 'object' ? extras : {};
  const evidence = classifyExistingPhotoTags(tagsText, calendar, extra);
  const hasDate = evidence.tokens.some(isDateTag);
  const hasPlace = evidence.places.length > 0;
  const hasPerson = evidence.people.length > 0;
  const pending = extra.sourceAvailable === false;
  const missing = [];
  if (!pending) {
    if (!hasDate) missing.push('날짜');
    if (!hasPlace && !evidence.placeExcluded) missing.push('장소');
    if (!hasPerson && !evidence.personExcluded) missing.push('인물');
  }
  return {
    hasDate, hasPlace, hasPerson, missing, evidence,
    isComplete: !pending && missing.length === 0,
    status: pending ? 'pending' : missing.length ? 'unclassified' : 'complete'
  };
}
