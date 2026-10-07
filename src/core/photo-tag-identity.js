import { KOREA_REGIONS } from './korean-regions.js';

export function compactTagIdentity(value) {
  return String(value || '').normalize('NFKC').replace(/[\s_\-./(),[\]{}'"`~!@#$%^&*+=|\\:;<>?·•]+/g, '').toLowerCase();
}

function labelText(value) {
  return value && typeof value === 'object' ? String(value.name || value.label || value.tag || value.value || '') : String(value || '');
}

export function photoTagTokens(value) {
  const values = (Array.isArray(value) ? value : [value]).flat(Infinity);
  return [...new Set(values.flatMap(entry => {
    const text = labelText(entry).normalize('NFKC');
    // Historical captions can contain a spaced hashtag (#속리산 숲체험휴양마을).
    // Retain its complete identity as well as the old whitespace-separated tokens.
    return [...text.split(/[\s,#]+/), ...Array.from(text.matchAll(/#([^#\n,]+)/g), match => match[1].trim())];
  }).map(compactTagIdentity).filter(Boolean))];
}

export function identityLabels(record) {
  if (typeof record === 'string') return [record];
  return [record?.name, record?.title, record?.label, record?.tag, record?.value, record?.alias, record?.nickname, record?.displayName,
    ...(Array.isArray(record?.aliases) ? record.aliases : [])].map(labelText).filter(Boolean);
}

export function personNameVariants(name) {
  const text = compactTagIdentity(name);
  return /^[가-힣]{3}$/.test(text) ? [text, text.slice(1)] : text ? [text] : [];
}

export function tagMatchesPerson(token, variants) {
  const value = compactTagIdentity(token);
  return variants.some(variant => {
    const name = compactTagIdentity(variant);
    if (value === name) return true;
    // Photo/event suffixes describe the named person. Relationship suffixes do not:
    // 유리엄마 is a different person from 유리, even when only the child is registered.
    if (name.length < 2 || !value.startsWith(name)) return false;
    return /^(사진|생일|셀카|가족|여행|이|이랑|와|과)$/.test(value.slice(name.length));
  });
}

export function placeNameTokens(place) {
  return [...new Set(identityLabels(place).map(compactTagIdentity).filter(Boolean))];
}

const placeMatcherCache = new WeakMap();
function placeMatcher(place) {
  const labels = identityLabels(place);
  const signature = JSON.stringify(labels);
  const cached = place && typeof place === 'object' ? placeMatcherCache.get(place) : null;
  if (cached?.signature === signature) return cached.match;
  const names = [...new Set(labels.map(compactTagIdentity).filter(Boolean))];
  const legacy = labels.flatMap(raw => {
    const compact = compactTagIdentity(raw);
    return [compactTagIdentity(raw.replace(/[\s#,]+/g, '').slice(0, 30)), compact.slice(0, 24), compact.slice(0, 30)];
  });
  const result = tag => legacy.includes(tag) || names.some(name => tag === name || (name.length >= 2
    && tag.startsWith(name) && /^(야경|사진|여행|방문|풍경|나들이|야외|실내)$/.test(tag.slice(name.length))));
  if (place && typeof place === 'object') placeMatcherCache.set(place, { signature, match: result });
  return result;
}

export function photoMatchesPlaceTag(photo, place) {
  return photoTagTokens(photo?.tags).some(placeMatcher(place));
}

const PROVINCES = '서울 서울시 서울특별시 부산 부산시 부산광역시 대구 대구시 대구광역시 인천 인천시 인천광역시 광주 광주시 광주광역시 대전 대전시 대전광역시 울산 울산시 울산광역시 세종 세종시 세종특별자치시 경기도 강원도 강원특별자치도 충청북도 충북 충청남도 충남 전라북도 전북 전북특별자치도 전라남도 전남 경상북도 경북 경상남도 경남 제주 제주도 제주특별자치도'.split(' ');
const ADMIN_REGIONS = new Set([...PROVINCES, ...KOREA_REGIONS.flatMap(row => row.gugun)]);

export function isAdministrativePlaceTag(tag) {
  const value = compactTagIdentity(tag);
  if (ADMIN_REGIONS.has(value)) return true;
  // Uploader historically emits compound tags such as 경기도광명시. Never mistake 서울랜드
  // for an administrative address: the suffix must itself be a known district/city.
  return PROVINCES.some(province => value.startsWith(province) && ADMIN_REGIONS.has(value.slice(province.length)));
}

export function classifyExistingPhotoTags(tagsText, calendar = {}, extra = {}) {
  const tokens = photoTagTokens([tagsText, ...(Array.isArray(extra.caption) ? extra.caption : [extra.caption]), ...(Array.isArray(extra.tags) ? extra.tags : [extra.tags])]);
  const labels = [calendar.participants, calendar.customPersonTags, calendar.personTags].flatMap(value => Array.isArray(value) ? value.flatMap(identityLabels) : []);
  const people = tokens.filter(token => labels.some(label => tagMatchesPerson(token, personNameVariants(label))));
  const places = Array.isArray(calendar.places) ? calendar.places : Object.values(calendar.places || {});
  const placeMatchers = places.map(placeMatcher);
  const placeTokens = tokens.filter(token => isAdministrativePlaceTag(token) || placeMatchers.some(match => match(token)));
  const typedPeople = photoTagTokens(extra.personTags);
  const typedPlaces = photoTagTokens([extra.placeTags, extra.locationTags]);
  return {
    tokens,
    people: [...new Set([...people, ...typedPeople])],
    places: [...new Set([...placeTokens, ...typedPlaces])],
    personExcluded: tokens.includes('인물아님'), placeExcluded: tokens.includes('장소아님')
  };
}

/** Suppress a person suggestion only when both labels identify the same unique person. */
export function hasEquivalentPhotoTag(candidate, photo, calendar = {}) {
  const key = compactTagIdentity(candidate);
  const existing = photoTagTokens([photo?.tags, photo?.caption, photo?.personTags, photo?.placeTags, photo?.locationTags]);
  if (existing.includes(key)) return true;
  if (/^\d{6}$/.test(key) && existing.includes('20' + key)) return true;
  if (/^20\d{6}$/.test(key) && existing.includes(key.slice(2))) return true;
  const people = [calendar.participants, calendar.customPersonTags, calendar.personTags].flatMap(value => Array.isArray(value) ? value : []);
  const personVariants = people.map(person => identityLabels(person).flatMap(personNameVariants));
  const uniquePersonIndex = tag => {
    let matchedIndex = -1;
    for (let index = 0; index < personVariants.length; index += 1) {
      if (!tagMatchesPerson(tag, personVariants[index])) continue;
      if (matchedIndex !== -1) return -1;
      matchedIndex = index;
    }
    return matchedIndex;
  };
  const candidatePerson = uniquePersonIndex(key);
  if (candidatePerson !== -1 && existing.some(tag => uniquePersonIndex(tag) === candidatePerson)) return true;
  const places = Array.isArray(calendar.places) ? calendar.places : Object.values(calendar.places || {});
  return places.some(place => placeMatcher(place)(key) && existing.some(placeMatcher(place)));
}
