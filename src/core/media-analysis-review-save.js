/** Save canonical data before the audit record. Never report a failed write as reviewed. */
export async function persistMediaAnalysisReview({ changed, saveTags, saveReview }) {
  if (changed) {
    const result = await saveTags();
    if (result !== true && result?.ok !== true) throw new Error('태그를 저장하지 못했습니다. 다시 시도해 주세요.');
  }
  try {
    return await saveReview();
  } catch (cause) {
    throw new Error(changed
      ? '태그는 저장됐지만 검토 기록 저장에 실패했습니다. 다시 적용하면 기록만 재시도합니다.'
      : '검토 기록 저장에 실패했습니다. 다시 시도해 주세요.', { cause });
  }
}
