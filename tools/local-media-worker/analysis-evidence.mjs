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
  // Candidates are useful things for a person to verify, but they must never quietly turn into
  // tags.  In particular OCR proves that a name was written in the picture, not that the person
  // is in the picture, and GPS can be a few metres off in a dense venue.
  const candidateEvidence = [];
  // Suggested tags and recognised classifications serve different jobs.  Keeping the latter
  // prevents the review UI from treating a photo which already has #영우 / #광명시 as if the
  // analysis knew nothing about people or places simply because there is nothing new to add.
  const recognizedEvidence = [];
  const add = (value, source, confidence = 0) => {
    const tag = compact(value);
    if (!tag || tag.length > 40) return '';
    if (!tagEvidence.some(entry => entry.tag === tag && entry.source === source)) tagEvidence.push({ tag, source, confidence });
    return tag;
  };
  const recognize = (value, source = 'existing-tag', confidence = 1) => {
    const tag = compact(value);
    if (!tag || tag.length > 40) return '';
    if (!recognizedEvidence.some(entry => entry.tag === tag && entry.source === source)) recognizedEvidence.push({ tag, source, confidence });
    return tag;
  };
  const candidate = (value, source, confidence = 0) => {
    const tag = compact(value);
    if (!tag || tag.length > 40) return '';
    if (!candidateEvidence.some(entry => entry.tag === tag && entry.source === source)) candidateEvidence.push({ tag, source, confidence });
    return tag;
  };
  const has = value => existing.includes(compact(value));
  const participants = rows(calendar.participants).filter(active).map(row => String(row.name || '').trim()).filter(Boolean);
  const places = rows(calendar.places).filter(active);
  const existingTypes = classifyExistingPhotoTags(photo.tags, calendar, photo);
  const people = existingTypes.people.map(name => recognize(name));
  const placeTags = existingTypes.places.map(name => recognize(name));
  // OCR may identify a written name, not the person in the photograph. Always manual.
  const words = new Set((insight.ocrText || []).flatMap(tokens));
  if (!existingTypes.personExcluded) participants.filter(name => name.length >= 2 && words.has(name) && !has(name)).forEach(name => people.push(candidate(name, 'ocr-person', 0.8)));
  if (!existingTypes.placeExcluded && coords(photo.latitude, photo.longitude)) {
    const nearby = places.filter(p => coords(p.lat ?? p.latitude, p.lng ?? p.longitude)).map(p => ({
      name: p.name || p.title,
      distance: Math.hypot((Number(p.lat ?? p.latitude) - Number(photo.latitude)) * 111000,
        (Number(p.lng ?? p.longitude) - Number(photo.longitude)) * 111000 * Math.cos(Number(photo.latitude) * Math.PI / 180))
    })).filter(p => p.distance <= 250).sort((a, b) => a.distance - b.distance);
    // Crowded venues are ambiguous. Do not manufacture certainty from the nearest candidate.
    if (nearby.length === 1 && nearby[0].name && !has(nearby[0].name)) placeTags.push(candidate(nearby[0].name, 'gps-place', 0.8));
  }
  const captured = captureDateKey(photo.capturedAt);
  const date = captured || (/^\d{4}-\d{2}-\d{2}$/.test(photo.meetingDate || '') ? photo.meetingDate : '');
  // Upload timestamps never stand in for capture timestamps.
  if (date && !existing.some(tag => /^\d{6}(?:\d{2})?$/.test(tag))) add(date.replaceAll('-', '').slice(2), captured ? 'capture-date' : 'meeting-date', captured ? 1 : 0);
  const meetings = (Array.isArray(calendar.confirmedMeeting) ? calendar.confirmedMeeting : [calendar.confirmedMeeting])
    .filter(active).filter(row => row.confirmed !== false && date && String(row.date || row.id) === date)
    .map(row => candidate(row.title || row.name || row.note, 'meeting-date', 0.7)).filter(Boolean);
  // Scene labels ("food", "outdoor", "text" …) are intentionally retained only as a visual
  // aid. They are not calendar facts and are the source of the unusable noise in the old feed.
  // `learned` has already passed two independent human approvals in the calibration ledger.
  learned.forEach(tag => add(tag, 'learned-feedback', 1));
  const suggestedTags = [...new Set(tagEvidence.map(entry => entry.tag))]
    .filter(tag => !hasEquivalentPhotoTag(tag, photo, calendar)).slice(0, 20);
  return {
    analysisVersion: 6, suggestedTags, tagEvidence: tagEvidence.filter(entry => suggestedTags.includes(entry.tag)).slice(0, 40),
    recognizedEvidence: recognizedEvidence.slice(0, 40),
    candidateEvidence: candidateEvidence.slice(0, 40),
    people: [...new Set(people.filter(Boolean))], places: [...new Set(placeTags.filter(Boolean))], meetings: [...new Set(meetings)],
    scenes: (insight.labels || []).filter(row => Number(row.confidence) >= 0.65).map(row => row.name).slice(0, 12),
    // Backward-compatible field: scene confidence only. Never used for mutation eligibility.
    confidence: Math.max(0, ...((insight.labels || []).map(row => Number(row.confidence) || 0)))
  };
}
