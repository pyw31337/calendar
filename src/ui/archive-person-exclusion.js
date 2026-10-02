// 보관함 인물 탭의 "제외": a photo leaves a classification, nothing is deleted.
//
// Only the lightbox's single-photo delete removes a photo. In 인물 a selection is taken out of
// what it is filed under instead:
//   - 분류 필요 → the photo gets the 인물아님 mark (same idea as 장소아님 in archive-place-groups.js),
//     so it is no longer counted as needing a person tag;
//   - a person → that person's tag is removed from the photo (every tag the person matches).

export const NOT_A_PERSON_TAG = '인물아님';

const splitTags = tagsText => {
  const tokens = [];
  const seen = new Set();
  String(tagsText || '').split(/[,\s#]+/).forEach(raw => {
    const token = String(raw || '').trim();
    if (!token || seen.has(token)) return;
    seen.add(token);
    tokens.push(token);
  });
  return tokens;
};

export function isExcludedFromPeople(tagsText) {
  return splitTags(tagsText).includes(NOT_A_PERSON_TAG);
}

// Same name variants the 인물 tab matches with: a 2-3 letter Korean name also matches without
// its family name ("박영우" -> "영우").
export function personNameVariants(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return [];
  const variants = new Set([trimmed]);
  if (/^[가-힣]{2,3}$/.test(trimmed)) variants.add(trimmed.slice(1));
  return Array.from(variants).map(value => value.toLowerCase());
}

// The 인물 tab's rule: a 1-letter variant only as an exact tag, longer ones inside a tag too.
export function tagMatchesPerson(token, variants) {
  const value = String(token || '').toLowerCase();
  return variants.some(variant => (variant.length <= 1 ? value === variant : value.includes(variant)));
}

// Puts 인물아님 in front so a photo at the 20-tag cap still leaves 분류 필요.
export function withNotAPersonTag(tagsText) {
  const tokens = splitTags(tagsText);
  const before = tokens.join(' ');
  if (tokens.includes(NOT_A_PERSON_TAG)) return { status: 'already', tags: before, before };
  return { status: 'add', tags: [NOT_A_PERSON_TAG, ...tokens].slice(0, 20).join(' '), before };
}

export function withoutPersonTag(tagsText, personLabel) {
  const tokens = splitTags(tagsText);
  const before = tokens.join(' ');
  const variants = personNameVariants(personLabel);
  if (!variants.length) return { status: 'already', tags: before, before };
  const kept = tokens.filter(token => !tagMatchesPerson(token, variants));
  if (kept.length === tokens.length) return { status: 'already', tags: before, before };
  return { status: 'remove', tags: kept.join(' '), before };
}
