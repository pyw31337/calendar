'use strict';

const crypto = require('crypto');

const MAX_BATCH_ITEMS = 100;
const MAX_TAGS = 20;
const MAX_TEXT = 640;
const MAX_OCR_LINES = 12;
const MAX_LABELS = 16;
const EVIDENCE_SOURCES = new Set(['existing-tag', 'capture-date', 'meeting-date', 'gps-place', 'ocr-person', 'vision-label', 'learned-feedback']);

function tagEvidenceList(value) {
  return (Array.isArray(value) ? value : []).slice(0, 40).map(entry => ({
    tag: text(entry?.tag, 80).replace(/^#+/, '').trim(),
    source: text(entry?.source, 24),
    confidence: typeof entry?.confidence === 'number' && Number.isFinite(entry.confidence)
      ? Math.max(0, Math.min(1, entry.confidence)) : 0
  })).filter(entry => entry.tag && EVIDENCE_SOURCES.has(entry.source));
}

function text(value, max = MAX_TEXT) {
  return Array.from(String(value == null ? '' : value), character => character.charCodeAt(0) < 32 ? ' ' : character)
    .join('').trim().slice(0, max);
}

function integer(value, fallback = 0) {
  const result = Number(value);
  return Number.isFinite(result) ? Math.round(result) : fallback;
}

function tagList(value, max = MAX_TAGS) {
  const raw = Array.isArray(value) ? value : [];
  return Array.from(new Set(raw
    .map(item => text(item, 80).replace(/^#+/, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean))).slice(0, max);
}

function labelList(value) {
  const raw = Array.isArray(value) ? value : [];
  return raw.map(item => ({
    name: text(item?.name || item?.identifier || item, 120),
    confidence: Math.max(0, Math.min(1, Number(item?.confidence) || 0))
  })).filter(item => item.name).slice(0, MAX_LABELS);
}

function ocrList(value) {
  const raw = Array.isArray(value) ? value : [];
  return raw.map(item => text(item, 160)).filter(Boolean).slice(0, MAX_OCR_LINES);
}

function stableAnalysisId(sourceKey) {
  return crypto.createHash('sha256').update(String(sourceKey), 'utf8').digest('hex');
}

function sanitizeAnalysisItem(item = {}, now = Date.now()) {
  const sourceKey = text(item.sourceKey || item.assetKey, 180);
  const assetKey = text(item.assetKey || sourceKey, 180);
  if (!sourceKey || !/^[A-Za-z0-9:_-]{3,180}$/.test(sourceKey)) return null;
  // Match the canonical photoIndex identity.  The ingestion endpoint later checks that this
  // exact document is still live, so neither a filename nor a URL can become a write target.
  if (!/^asset:v1:[A-Za-z0-9-]{1,80}$/.test(assetKey) || sourceKey !== assetKey) return null;
  const insight = item.insight && typeof item.insight === 'object' ? item.insight : {};
  const tags = tagList(item.suggestedTags || insight.suggestedTags);
  const people = tagList(item.people || item.personCandidates);
  const places = tagList(item.places || item.placeCandidates);
  const meetings = tagList(item.meetings || item.meetingCandidates);
  const scenes = tagList(item.scenes || insight.suggestedTags);
  return {
    id: stableAnalysisId(sourceKey),
    sourceKey,
    assetKey,
    sourceUpdatedAt: Math.max(0, integer(item.sourceUpdatedAt)),
    analyzedAt: Math.max(0, integer(item.analyzedAt, now)),
    analysisVersion: Math.max(1, integer(item.analysisVersion, 1)),
    suggestedTags: tags,
    tagEvidence: tagEvidenceList(item.tagEvidence),
    people,
    places,
    meetings,
    scenes,
    labels: labelList(insight.labels || item.labels),
    ocrText: ocrList(insight.ocrText || item.ocrText),
    faceCount: Math.max(0, Math.min(99, integer(insight.faceCount ?? item.faceCount))),
    confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0)),
    source: text(item.source || 'photo-index', 40) || 'photo-index',
    status: text(item.status || 'suggested', 24) || 'suggested',
    // A bounded error lets the server audit a failed asset without retaining a URL, filename,
    // or image content.  A successful retry overwrites this field for the same immutable key.
    error: text(item.error, 280),
    // 64-bit difference hash of the picture (Mac worker), only for "비슷한 사진" hints.
    ...(/^[0-9a-f]{16}$/.test(String(item.lookHash || insight.lookHash || '')) ? { lookHash: String(item.lookHash || insight.lookHash) } : {})
  };
}

const MAX_SIMILAR_GROUPS = 60;
const MAX_SIMILAR_GROUP_SIZE = 8;

// Groups of photos that look alike but are different files (worker-computed). Asset keys only.
function sanitizeSimilarGroups(value) {
  return (Array.isArray(value) ? value : [])
    .map(group => Array.from(new Set((Array.isArray(group) ? group : [])
      .map(key => String(key || ''))
      .filter(key => /^asset:v1:[A-Za-z0-9-]{1,80}$/.test(key)))).slice(0, MAX_SIMILAR_GROUP_SIZE))
    .filter(group => group.length >= 2)
    .slice(0, MAX_SIMILAR_GROUPS)
    .map(assetKeys => ({ assetKeys }));
}

const MAX_FACE_PEOPLE = 8;

function faceName(value) {
  return text(value, 80).replace(/^#+/, '').replace(/\s+/g, ' ').trim();
}

// Face recognition runs only on the family's Mac (tools/local-media-worker/face-tags.py). What
// reaches the server is a person-name suggestion per photo -- never a face image, crop or
// embedding. These fields live beside the Vision result on the same mediaAnalysis document and
// are written with merge, so neither worker overwrites the other's fields. Names the family has
// rejected for a photo (faceRejected) are never suggested for it again.
function sanitizeFaceItem(item = {}, rejected = [], now = Date.now()) {
  const assetKey = text(item.assetKey, 180);
  if (!/^asset:v1:[A-Za-z0-9-]{1,80}$/.test(assetKey)) return null;
  const blocked = new Set((Array.isArray(rejected) ? rejected : []).map(faceName));
  const seen = new Set();
  const facePeople = [];
  (Array.isArray(item.facePeople) ? item.facePeople : []).forEach(entry => {
    const name = faceName(entry?.name);
    if (!name || seen.has(name) || blocked.has(name) || facePeople.length >= MAX_FACE_PEOPLE) return;
    seen.add(name);
    facePeople.push({ name, score: Math.round(Math.max(0, Math.min(1, Number(entry?.score) || 0)) * 1000) / 1000 });
  });
  return {
    id: stableAnalysisId(assetKey),
    assetKey,
    sourceKey: assetKey,
    facePeople,
    faceSuggested: facePeople.length > 0,
    faceCount: Math.max(0, Math.min(99, integer(item.faceCount))),
    faceAnalyzedAt: Math.max(0, integer(item.faceAnalyzedAt, now))
  };
}

function summarize(items = []) {
  const successful = items.filter(item => item.status === 'suggested').length;
  return {
    received: items.length,
    suggested: successful,
    failed: items.length - successful,
    withPeople: items.filter(item => item.people.length).length,
    withPlaces: items.filter(item => item.places.length).length,
    withMeetings: items.filter(item => item.meetings.length).length,
    withText: items.filter(item => item.ocrText.length).length
  };
}

module.exports = {
  MAX_BATCH_ITEMS,
  MAX_TAGS,
  faceName,
  sanitizeAnalysisItem,
  sanitizeFaceItem,
  sanitizeSimilarGroups,
  stableAnalysisId,
  summarize
};
