/**
 * 보관함 "추천" 탭: tag suggestions computed from the photos' own context, so most photos get their
 * 날짜/장소/인물 tags in a few taps instead of one lightbox edit each.
 *
 * Rules, strongest first. Every rule only ADDS tags (never removes) and skips photos that already
 * carry a tag of that kind:
 *   - place / registered: the 장소 tab already files the photo under a registered place by GPS,
 *     upload batch or visit date (archive-place-groups.js) but the photo has no tag for it, so the
 *     place is only implied on that one screen -- the tag makes search, 추억 and 인물 see it too.
 *   - place / same day: on a day where most place-tagged photos name ONE place (at least two
 *     anchors, >= 70%), the day's untagged camera photos and 일정 uploads get it.
 *   - batch / common tag: within one upload batch (same message, same date), a tag carried by at
 *     least two photos and by >= 60% of the batch's tagged photos is offered to the rest of the
 *     batch -- event and place names the family types that are not registered places
 *     (강원랜드, 김치볶음밥). Dates, device names and people are left to their own rules.
 *   - date / album: a photo uploaded straight into a date's album (일정 사진) without any date tag
 *     gets that date (YYMMDD, the format the app itself writes).
 *   - person / same day: people tagged on the day's other photos, ranked by how many of them they
 *     appear on. Who is in a given photo cannot be inferred from context, so these are offered as
 *     per-day chips the reader applies to the photos they pick -- never applied wholesale.
 *
 * Pure (no window/React) so it can be unit-tested.
 */

import { isLikelyCameraPhoto, isDismissedFromPlaces, photoMatchesPlaceTag, placeTagToken } from './archive-place-groups.js';

const SAME_DAY_PLACE_SHARE = 0.7;
const SAME_DAY_PLACE_MIN_ANCHORS = 2;
const MAX_PERSON_CANDIDATES = 8;
const BATCH_TAG_SHARE = 0.6;
const BATCH_TAG_MIN_PHOTOS = 2;
const DEVICE_TAG = /(아이폰|갤럭시|iphone|galaxy|픽셀|pixel|샤오미|xiaomi|소니|sony|캐논|canon|니콘|nikon|후지|fujifilm|고프로|gopro|samsung|apple)/i;
// Pieces of a split camera model ("Apple iPhone 14 Pro") and bare numbers are not subjects.
const MODEL_PART_TAG = /^(\d+|pro|max|plus|ultra|mini|fold\d*|flip\d*|se|lite)$/i;
const DATE_TAG = /^(\d{6}|\d{8}|\d{2,4}[.\-/]\d{1,2}[.\-/]\d{1,2})$/;

const tokensOf = photo => String(photo?.tags || '').split(/[,\s#]+/).map(token => token.trim()).filter(Boolean);

export function photoSuggestionKey(photo) {
  return String(photo?.assetKey || photo?.mediaKey || photo?.refKey || photo?.full || photo?.thumb || photo?.id || '');
}

function isScheduleUpload(photo) {
  return String(photo?.uploadSource || photo?.source || '').toLowerCase() === 'meeting';
}

// YYYY-MM-DD of the album a photo was uploaded into: the photoIndex meetingDate, or the date the
// album upload put into the message id (meeting_<calendar>_<YYYY-MM-DD>_...).
export function albumDateOf(photo) {
  const meetingDate = String(photo?.meetingDate || '').slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(meetingDate)) return meetingDate;
  const match = String(photo?.messageId || photo?.sourceMessageId || '').match(/^meeting_.+?_(\d{4}-\d{2}-\d{2})_/);
  return match ? match[1] : '';
}

export function dateTagToken(isoDate) {
  const match = String(isoDate || '').match(/^\d{2}(\d{2})-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}${match[2]}${match[3]}` : '';
}

/**
 * Person labels as the 인물 tab lists them, each with the tag variants that count as that person
 * (a 3-syllable name also matches its given name: 박서준 -> 서준).
 */
export function personLabelMatchers(labels) {
  return (Array.isArray(labels) ? labels : [])
    .map(label => String(label || '').trim())
    .filter(Boolean)
    .map(label => ({ label, variants: /^[가-힣]{3}$/.test(label) ? [label, label.slice(1)] : [label] }));
}

// The spelling the photo actually uses (서준, not 박서준), so a suggestion adds the same tag the
// family already types and the 인물 tab groups it with the rest.
function peopleIn(photo, matchers) {
  const tokens = tokensOf(photo);
  const found = [];
  matchers.forEach(matcher => {
    const variant = matcher.variants.find(value => tokens.includes(value));
    if (variant && !found.includes(variant)) found.push(variant);
  });
  return found;
}

/**
 * @param {object} args
 * @param {Array} args.photos archive photo entries
 * @param {Array} args.places registered places
 * @param {{ groups: Array }} args.placeGroups buildPlacePhotoGroups() result for the same photos
 * @param {(photo) => string[]} args.getPhotoDates every YYYY-MM-DD date the photo carries in its tags
 * @param {string[]} args.personLabels participant names + 인물 tags
 * @returns {{ groups: Array<{ id, kind, rule, rules, dates, tag, title, photos }>, personDays: Array<{ date, photos, candidates }>,
 *             autoPhotoCount: number }}
 */
export function buildTagSuggestions({ photos = [], places = [], placeGroups = null, getPhotoDates, personLabels = [] }) {
  const list = (Array.isArray(photos) ? photos : []).filter(photo => photo && photoSuggestionKey(photo));
  const livePlaces = (Array.isArray(places) ? places : []).filter(place => place && !place.deletedAt && placeTagToken(place));
  const datesOf = photo => Array.from(new Set(((typeof getPhotoDates === 'function' ? getPhotoDates(photo) : []) || [])
    .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(String(date || '')))));
  const hasPlaceTag = photo => livePlaces.some(place => photoMatchesPlaceTag(photo, place));
  const groups = [];
  const claimedForPlace = new Set();

  // 1. registered place groups (GPS / batch / visit date) -> write the implied tag.
  (placeGroups?.groups || []).forEach(group => {
    const tag = placeTagToken(group.place);
    if (!tag) return;
    const missing = (group.photos || []).filter(photo => !photoMatchesPlaceTag(photo, group.place) && !isDismissedFromPlaces(photo));
    const fresh = missing.filter(photo => !claimedForPlace.has(photoSuggestionKey(photo)));
    if (!fresh.length) return;
    fresh.forEach(photo => claimedForPlace.add(photoSuggestionKey(photo)));
    groups.push({ id: `place:${group.key}`, kind: 'place', rule: 'registered', tag, title: group.place.name || tag, photos: fresh });
  });

  // 2. same-day majority place.
  const byDate = new Map();
  list.forEach(photo => datesOf(photo).forEach(date => {
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push(photo);
  }));
  Array.from(byDate.keys()).sort().reverse().forEach(date => {
    const dayPhotos = byDate.get(date);
    const counts = new Map();
    let anchors = 0;
    dayPhotos.forEach(photo => {
      const named = livePlaces.filter(place => photoMatchesPlaceTag(photo, place));
      if (!named.length) return;
      anchors += 1;
      named.forEach(place => counts.set(place, (counts.get(place) || 0) + 1));
    });
    if (anchors < SAME_DAY_PLACE_MIN_ANCHORS) return;
    const [place, count] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] || [];
    if (!place || count / anchors < SAME_DAY_PLACE_SHARE) return;
    const fresh = dayPhotos.filter(photo => (isLikelyCameraPhoto(photo) || isScheduleUpload(photo))
      && !hasPlaceTag(photo) && !isDismissedFromPlaces(photo) && !claimedForPlace.has(photoSuggestionKey(photo)));
    if (!fresh.length) return;
    fresh.forEach(photo => claimedForPlace.add(photoSuggestionKey(photo)));
    const tag = placeTagToken(place);
    groups.push({ id: `day-place:${date}:${tag}`, kind: 'place', rule: 'same-day', date, tag, title: place.name || tag, photos: fresh });
  });

  // 3. tags most of an upload batch shares.
  const matchers = personLabelMatchers(personLabels);
  const personVariants = new Set(matchers.flatMap(matcher => matcher.variants));
  const placeTags = new Set(livePlaces.map(placeTagToken));
  const isBatchTag = token => !DATE_TAG.test(token) && !DEVICE_TAG.test(token) && !MODEL_PART_TAG.test(token) && !personVariants.has(token)
    && !placeTags.has(token) && token !== '장소아님';
  const batches = new Map();
  list.forEach(photo => {
    const batch = String(photo?.messageId || '');
    if (!batch) return;
    datesOf(photo).forEach(date => {
      const key = `${batch}|${date}`;
      if (!batches.has(key)) batches.set(key, []);
      batches.get(key).push(photo);
    });
  });
  const batchByTag = new Map();
  batches.forEach(batchPhotos => {
    if (batchPhotos.length < 3) return;
    const tagged = batchPhotos.filter(photo => tokensOf(photo).some(isBatchTag));
    if (tagged.length < BATCH_TAG_MIN_PHOTOS) return;
    const counts = new Map();
    tagged.forEach(photo => new Set(tokensOf(photo).filter(isBatchTag)).forEach(token => counts.set(token, (counts.get(token) || 0) + 1)));
    counts.forEach((count, token) => {
      if (count < BATCH_TAG_MIN_PHOTOS || count / tagged.length < BATCH_TAG_SHARE) return;
      const missing = batchPhotos.filter(photo => !tokensOf(photo).includes(token) && !isDismissedFromPlaces(photo));
      if (!missing.length) return;
      if (!batchByTag.has(token)) batchByTag.set(token, new Map());
      const bucket = batchByTag.get(token);
      missing.forEach(photo => bucket.set(photoSuggestionKey(photo), photo));
    });
  });
  Array.from(batchByTag.entries())
    .sort((a, b) => b[1].size - a[1].size)
    .forEach(([tag, bucket]) => {
      groups.push({ id: `batch:${tag}`, kind: 'tag', rule: 'batch', tag, title: tag, photos: Array.from(bucket.values()) });
    });

  // 4. album date for photos without any date tag.
  const byAlbum = new Map();
  list.forEach(photo => {
    if (datesOf(photo).length) return;
    const tag = dateTagToken(albumDateOf(photo));
    if (!tag) return;
    if (!byAlbum.has(tag)) byAlbum.set(tag, []);
    byAlbum.get(tag).push(photo);
  });
  Array.from(byAlbum.keys()).sort().reverse().forEach(tag => {
    groups.push({ id: `date:${tag}`, kind: 'date', rule: 'album', tag, title: tag, photos: byAlbum.get(tag) });
  });

  // 5. person candidates per day.
  const personDays = [];
  if (matchers.length) {
    Array.from(byDate.keys()).sort().reverse().forEach(date => {
      const dayPhotos = byDate.get(date);
      const tally = new Map();
      const missing = [];
      dayPhotos.forEach(photo => {
        const people = peopleIn(photo, matchers);
        if (!people.length) { missing.push(photo); return; }
        people.forEach(label => tally.set(label, (tally.get(label) || 0) + 1));
      });
      if (!missing.length || !tally.size) return;
      const tagged = dayPhotos.length - missing.length;
      const candidates = Array.from(tally.entries())
        .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
        .slice(0, MAX_PERSON_CANDIDATES)
        .map(([label, count]) => ({ label, count, share: tagged ? count / tagged : 0 }));
      personDays.push({ date, photos: missing, candidates });
    });
  }

  // One card per tag: 서울랜드 found by GPS on one day and by the day's majority on three others is
  // one thing to approve, not four.
  const merged = new Map();
  groups.forEach(group => {
    const prev = merged.get(group.tag);
    if (!prev) {
      merged.set(group.tag, { ...group, id: `tag:${group.tag}`, rules: [group.rule], dates: group.date ? [group.date] : [] });
      return;
    }
    const seen = new Set(prev.photos.map(photoSuggestionKey));
    group.photos.forEach(photo => { if (!seen.has(photoSuggestionKey(photo))) prev.photos.push(photo); });
    if (!prev.rules.includes(group.rule)) prev.rules.push(group.rule);
    if (group.date && !prev.dates.includes(group.date)) prev.dates.push(group.date);
  });
  const cards = Array.from(merged.values()).sort((a, b) => b.photos.length - a.photos.length);
  return {
    groups: cards,
    personDays,
    autoPhotoCount: new Set(cards.flatMap(card => card.photos.map(photoSuggestionKey))).size,
  };
}
