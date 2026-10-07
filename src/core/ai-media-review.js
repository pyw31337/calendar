/**
 * Guardrails for AI-assisted photo tagging.
 *
 * The local vision worker is deliberately allowed to make broad suggestions, but a bulk
 * mutation must be much stricter.  Keeping this policy in a pure module makes the rule
 * testable and prevents a new gallery surface from quietly reintroducing "apply everything".
 */

import { hasEquivalentPhotoTag } from './photo-tag-identity.js';
export const AI_REVIEW_MAX_TAGS = 20;

export function normalizeAnalysisTagList(values, { limit = AI_REVIEW_MAX_TAGS } = {}) {
  const input = (Array.isArray(values) ? values : [values])
    .flatMap(value => String(value || '').split(/[\s,#]+/));
  return Array.from(new Set(input
    .map(value => String(value || '').replace(/^#+/, '').trim())
    .filter(Boolean))).slice(0, limit);
}

export function prepareAnalysisTags(photo, requested, { decision = 'applied', originalTags, calendar } = {}) {
  const current = normalizeAnalysisTagList(photo?.tags, { limit: Infinity });
  const draft = normalizeAnalysisTagList(requested, { limit: Infinity });
  let next;
  if (decision === 'edited') {
    if (originalTags == null || current.join(' ') !== normalizeAnalysisTagList(originalTags, { limit: Infinity }).join(' ')) {
      throw new Error('수정 중 사진 태그가 변경되었습니다. 새로고침 후 다시 확인해 주세요.');
    }
    next = draft; // Explicit removal must not be restored by merging the old tags back in.
  } else {
    next = [...current, ...draft.filter(tag => !hasEquivalentPhotoTag(tag, photo, calendar))];
  }
  if (next.length > AI_REVIEW_MAX_TAGS || next.some(tag => tag.length > 30) || next.join(' ').length > 640) throw new Error('태그 저장 한도를 초과합니다. 기존 태그를 지우지 않고 중단했습니다.');
  return next;
}

export function getAnalysisSuggestedTags(item) {
  // New workers separate already-classified people/places from NEW recommendations.
  if (Number(item?.analysisVersion) >= 5 && Array.isArray(item?.suggestedTags)) return normalizeAnalysisTagList(item.suggestedTags);
  return normalizeAnalysisTagList([
    ...(Array.isArray(item?.suggestedTags) ? item.suggestedTags : []),
    ...(Array.isArray(item?.people) ? item.people : []),
    ...(Array.isArray(item?.places) ? item.places : []),
    ...(Array.isArray(item?.meetings) ? item.meetings : [])
  ]);
}

// A scene classifier's score is NOT a probability that an inferred person, venue or event is
// correct. Only direct metadata may qualify a tag for the explicit bulk-review convenience.
// Even a GPS-nearest venue can be wrong in a mall; it stays a manual suggestion.
const DIRECT_SOURCES = new Set(['existing-tag', 'capture-date']);

export function getMediaAnalysisReview(item, { photo } = {}) {
  const suggestedTags = getAnalysisSuggestedTags(item);
  const evidence = Array.isArray(item?.tagEvidence) ? item.tagEvidence : [];
  const reasons = [];
  if (!evidence.length) reasons.push('태그별 근거가 없는 이전 분석입니다. 사진을 확인해 주세요.');
  const stale = photo && Number(photo.updatedAt) > Number(item?.sourceUpdatedAt || 0);
  if (stale) reasons.push('분석 이후 사진 정보가 변경되었습니다.');
  const eligibleTags = suggestedTags.filter(tag => !stale && evidence.some(entry =>
    entry?.tag === tag && DIRECT_SOURCES.has(entry.source)
      && Number.isFinite(entry.confidence) && entry.confidence === 1
      && (entry.source !== 'existing-tag' || !photo || normalizeAnalysisTagList(photo.tags).includes(tag))
  ));
  const manualTags = suggestedTags.filter(tag => !eligibleTags.includes(tag));
  if (manualTags.length) reasons.push('인물·장소·일정·장면 추정은 직접 검토가 필요합니다.');
  return {
    suggestedTags, eligibleTags, manualTags, reasons,
    canBulkApply: Boolean(item?.assetKey && !item.review && item.status === 'suggested'
      && suggestedTags.length && !manualTags.length && !stale)
  };
}

export function isSafeMediaAutoApplyCandidate(item, options) {
  return getMediaAnalysisReview(item, options).canBulkApply;
}

export function getSafeMediaAutoApplyCandidates(items, options) {
  return (Array.isArray(items) ? items : []).filter(item => isSafeMediaAutoApplyCandidate(item, options));
}
