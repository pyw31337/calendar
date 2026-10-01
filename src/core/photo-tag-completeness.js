// AI 분석 "인물 누락" used to look only at calendar.participants[].name.
// 서준/도은 style labels are often customPersonTags (인물 탭) or an alias,
// and they already sit in the photo caption (the "기존" tag string). Those
// tagged people must not be reported missing.

function tagTokens(value) {
  const source = Array.isArray(value) ? value.join(' ') : value;
  return String(source || '')
    .split(/[\s,#]+/)
    .map(token => token.trim().toLowerCase())
    .filter(Boolean);
}

function pushLabel(labels, value) {
  const text = String(value || '').trim().toLowerCase();
  if (text) labels.add(text);
}

function personLabels(calendar, extras) {
  const labels = new Set();
  const participants = Array.isArray(calendar?.participants) ? calendar.participants : [];
  participants.forEach(person => {
    if (typeof person === 'string') {
      pushLabel(labels, person);
      return;
    }
    if (!person || typeof person !== 'object') return;
    pushLabel(labels, person.name);
    pushLabel(labels, person.alias);
    pushLabel(labels, person.nickname);
    pushLabel(labels, person.displayName);
    pushLabel(labels, person.label);
  });
  (Array.isArray(calendar?.customPersonTags) ? calendar.customPersonTags : []).forEach(tag => pushLabel(labels, tag));
  (Array.isArray(calendar?.personTags) ? calendar.personTags : []).forEach(tag => pushLabel(labels, tag));
  const explicit = extras && typeof extras === 'object' ? extras.personTags : null;
  (Array.isArray(explicit) ? explicit : tagTokens(explicit)).forEach(tag => pushLabel(labels, tag));
  return Array.from(labels);
}

function labelVariants(label) {
  const variants = [label];
  // 박서준 tagged as 서준. One-syllable leftovers ("연") stay exact-only so
  // they cannot swallow unrelated tokens.
  if (/^[가-힣]{3}$/.test(label)) variants.push(label.slice(1));
  return variants;
}

function tokensMatchLabel(tokens, label) {
  return labelVariants(label).some(variant => {
    if (variant.length < 2) return tokens.includes(variant);
    return tokens.some(token => token === variant || token.includes(variant));
  });
}

function placeNames(calendar) {
  return (Array.isArray(calendar?.places) ? calendar.places : [])
    .map(place => String(place?.name || place?.alias || place?.title || '').trim().toLowerCase())
    .filter(Boolean);
}

export function getPhotoTagCompleteness(tagsText, calendar, extras = null) {
  const extra = extras && typeof extras === 'object' ? extras : {};
  // The card prints photo.tags as "기존". Completeness used to read a different
  // string (review.finalTags only) and then ignore person-tag types inside it.
  const caption = [tagsText, extra.caption, extra.tags]
    .flatMap(value => (Array.isArray(value) ? value : [value]))
    .filter(value => value != null && String(value).trim())
    .join(' ');
  const rawTags = tagTokens(caption);

  const hasDate = rawTags.some(tag => /^\d{6}$/.test(tag) || /^\d{8}$/.test(tag) || /^\d{4}[.\-_]?\d{2}[.\-_]?\d{2}$/.test(tag));

  const places = placeNames(calendar);
  const hasPlace = rawTags.some(tag => places.some(name => tag.includes(name) || name.includes(tag)));

  const labels = personLabels(calendar, extra);
  // Caption/tag text that already contains a person-tag name (participant,
  // alias, or customPersonTags). A typed personTags list on the photo counts
  // even when that list was not copied into the caption string.
  const explicitPeople = tagTokens(extra.personTags).filter(token => token.length >= 2);
  const hasPerson = explicitPeople.length > 0
    || labels.some(label => tokensMatchLabel(rawTags, label));

  const missing = [];
  if (!hasDate) missing.push('날짜');
  if (!hasPlace) missing.push('장소');
  if (!hasPerson) missing.push('인물');

  return {
    hasDate,
    hasPlace,
    hasPerson,
    isComplete: missing.length === 0,
    missing
  };
}
