// Pure inference boundary: observed metadata and contextual guesses are deliberately separate.
import { classifyExistingPhotoTags, hasEquivalentPhotoTag } from '../../src/core/photo-tag-identity.js';
const active = row => row && !row.deletedAt && !row.removedAt && !row.isDeleted;
const rows = value => Array.isArray(value) ? value : Object.values(value || {});
const tokens = value => String(value || '').split(/[\s,#]+/).filter(Boolean);
const compact = value => String(value || '').trim().replace(/\s+/g, '');
const coords = (lat, lng) => lat != null && lng != null && lat !== '' && lng !== ''
  && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
  && Math.abs(Number(lat)) <= 90 && Math.abs(Number(lng)) <= 180;

export function captureDateKey(value) {
  if (!value) return '';
  // EXIF's wall-clock date has no time zone. Don't move it to another day by parsing as UTC.
  const wall = String(value).match(/^(\d{4})[-:](\d{2})[-:](\d{2})(?:$|[ T])/);
  if (wall && !/[Zz]|[+-]\d\d:\d\d$/.test(String(value))) {
    const key = `${wall[1]}-${wall[2]}-${wall[3]}`;
    const time = Date.parse(`${key}T00:00:00Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === key ? key : '';
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function classifyPhoto(photo = {}, insight = {}, calendar = {}, learned = []) {
  const existing = tokens(photo.tags);
  const tagEvidence = [];
  const add = (value, source, confidence = 0) => {
    const tag = compact(value);
    if (!tag || tag.length > 40) return '';
    if (!tagEvidence.some(entry => entry.tag === tag && entry.source === source)) tagEvidence.push({ tag, source, confidence });
    return tag;
  };
  const has = value => existing.includes(compact(value));
  const participants = rows(calendar.participants).filter(active).map(row => String(row.name || '').trim()).filter(Boolean);
  const places = rows(calendar.places).filter(active);
  const existingTypes = classifyExistingPhotoTags(photo.tags, calendar, photo);
  const people = existingTypes.people.map(name => add(name, 'existing-tag', 1));
  const placeTags = existingTypes.places.map(name => add(name, 'existing-tag', 1));
  // OCR may identify a written name, not the person in the photograph. Always manual.
  const words = new Set((insight.ocrText || []).flatMap(tokens));
  if (!existingTypes.personExcluded) participants.filter(name => name.length >= 2 && words.has(name) && !has(name)).forEach(name => people.push(add(name, 'ocr-person')));
  if (!existingTypes.placeExcluded && coords(photo.latitude, photo.longitude)) {
    const nearby = places.filter(p => coords(p.lat ?? p.latitude, p.lng ?? p.longitude)).map(p => ({
      name: p.name || p.title,
      distance: Math.hypot((Number(p.lat ?? p.latitude) - Number(photo.latitude)) * 111000,
        (Number(p.lng ?? p.longitude) - Number(photo.longitude)) * 111000 * Math.cos(Number(photo.latitude) * Math.PI / 180))
    })).filter(p => p.distance <= 250).sort((a, b) => a.distance - b.distance);
    // Crowded venues are ambiguous. Do not manufacture certainty from the nearest candidate.
    if (nearby.length === 1 && nearby[0].name && !has(nearby[0].name)) placeTags.push(add(nearby[0].name, 'gps-place'));
  }
  const captured = captureDateKey(photo.capturedAt);
  const date = captured || (/^\d{4}-\d{2}-\d{2}$/.test(photo.meetingDate || '') ? photo.meetingDate : '');
  // Upload timestamps never stand in for capture timestamps.
  if (date && !existing.some(tag => /^\d{6}(?:\d{2})?$/.test(tag))) add(date.replaceAll('-', '').slice(2), captured ? 'capture-date' : 'meeting-date', captured ? 1 : 0);
  const meetings = (Array.isArray(calendar.confirmedMeeting) ? calendar.confirmedMeeting : [calendar.confirmedMeeting])
    .filter(active).filter(row => row.confirmed !== false && date && String(row.date || row.id) === date)
    .map(row => add(row.title || row.name || row.note, 'meeting-date')).filter(Boolean);
  const sceneTags = (insight.suggestedTags || []).map(tag => add(tag, 'vision-label')).filter(Boolean);
  // A scene label like "food" cannot learn a person's identity, a location or a date.
  // Feedback may reinforce current scene tags only; it never introduces contextual tags.
  learned.filter(tag => sceneTags.includes(compact(tag))).forEach(tag => add(tag, 'learned-feedback'));
  const suggestedTags = [...new Set(tagEvidence.map(entry => entry.tag))]
    .filter(tag => !hasEquivalentPhotoTag(tag, photo, calendar)).slice(0, 20);
  return {
    analysisVersion: 5, suggestedTags, tagEvidence: tagEvidence.filter(entry => suggestedTags.includes(entry.tag)).slice(0, 40),
    people: [...new Set(people.filter(Boolean))], places: [...new Set(placeTags.filter(Boolean))], meetings: [...new Set(meetings)],
    scenes: (insight.labels || []).filter(row => Number(row.confidence) >= 0.65).map(row => row.name).slice(0, 12),
    // Backward-compatible field: scene confidence only. Never used for mutation eligibility.
    confidence: Math.max(0, ...((insight.labels || []).map(row => Number(row.confidence) || 0)))
  };
}
