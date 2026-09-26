/**
 * 보관함 "장소" 탭: groups archive photos by the calendar's registered places (장소 탭).
 *
 * A photo belongs to a place by, in order:
 *   1. a tag naming the place -- typed by hand, or added automatically at upload when the photo's
 *      GPS position is within ~200m of the place (photo-metadata-tags.js, nearestPlaceForCoords);
 *   2. its date: when every date the photo carries (meeting date / date hashtags) points at
 *      exactly ONE registered place visited that day, the photo is that place's -- for camera
 *      photos and 일정 uploads only (screenshots shared that day are not photos of the place).
 * Photos whose dates point at several places that day go to "분류 필요" (needs a place tag),
 * listed with those candidate places. Photos with no matching place at all are left out.
 *
 * Pure (no window/React) so it can be unit-tested.
 */

const MIN_PARTIAL_MATCH_LENGTH = 2;

// Same shape photo-metadata-tags.js compactHashtagToken gives a place-name tag: no spaces or
// punctuation, lower-case for latin letters.
export function compactPlaceToken(value) {
  return String(value || '')
    .replace(/[\s_\-./(),[\]{}'"`~!@#$%^&*+=|\\:;<>?·•]+/g, '')
    .toLowerCase();
}

export function placeNameTokens(place) {
  const names = [place?.name, place?.alias].map(compactPlaceToken).filter(Boolean);
  return Array.from(new Set(names));
}

function photoTagTokens(photo) {
  return String(photo?.tags || '')
    .split(/[,\s#]+/)
    .map(compactPlaceToken)
    .filter(Boolean);
}

export function photoMatchesPlaceTag(photo, place) {
  const names = placeNameTokens(place);
  if (!names.length) return false;
  const tokens = photoTagTokens(photo);
  // "#서울랜드" and "#서울랜드불꽃놀이" both count; a 1-letter name only counts as an exact tag.
  return names.some(name => tokens.some(tag => (
    tag === name || (name.length >= MIN_PARTIAL_MATCH_LENGTH && tag.includes(name))
  )));
}

// Camera photos carry a device hashtag (photo-metadata-tags.js formatDeviceHashtag, from EXIF);
// screenshots of maps, reservations and chats never do. Date-assigned groups pick up both, so a
// card's cover prefers a real photo over the booking screenshot someone shared that morning.
const CAMERA_DEVICE_TAG = /(아이폰|갤럭시|iphone|galaxy|픽셀|pixel|샤오미|xiaomi|소니|sony|캐논|canon|니콘|nikon|후지|fujifilm|고프로|gopro)/i;

export function isLikelyCameraPhoto(photo) {
  return CAMERA_DEVICE_TAG.test(String(photo?.tags || ''));
}

function isScheduleUpload(photo) {
  return String(photo?.uploadSource || photo?.source || '').toLowerCase() === 'meeting';
}

export function orderCoverPhotos(photos) {
  const list = Array.isArray(photos) ? photos : [];
  return [...list.filter(isLikelyCameraPhoto), ...list.filter(photo => !isLikelyCameraPhoto(photo))];
}

function placeKey(place, index) {
  return String(place?.id || `place_${index}`);
}

/**
 * @param {object} args
 * @param {Array} args.places registered places (deleted ones are skipped)
 * @param {Array} args.photos archive photo entries (each with `tags`, optional `meetingDate`)
 * @param {(photo) => string[]} args.getPhotoDates every YYYY-MM-DD date the photo carries
 * @param {(place, dateStr) => boolean} args.doesPlaceMatchDate
 * @returns {{ groups: Array<{ key, place, photos, byTag, byDate, lastDate }>,
 *             unclassified: Array<{ date, candidates, photos }>, unclassifiedCount: number }}
 */
export function buildPlacePhotoGroups({ places = [], photos = [], getPhotoDates, doesPlaceMatchDate }) {
  const livePlaces = (Array.isArray(places) ? places : [])
    .filter(place => place && !place.deletedAt && placeNameTokens(place).length);
  const groups = livePlaces.map((place, index) => ({
    key: placeKey(place, index),
    place,
    photos: [],
    byTag: 0,
    byDate: 0,
    lastDate: ''
  }));
  const unclassifiedByDate = new Map();
  const datesOf = typeof getPhotoDates === 'function' ? getPhotoDates : () => [];
  const matchesDate = typeof doesPlaceMatchDate === 'function' ? doesPlaceMatchDate : () => false;
  const placesOnDateCache = new Map();
  const placesOnDate = date => {
    if (!placesOnDateCache.has(date)) {
      placesOnDateCache.set(date, groups.filter(group => matchesDate(group.place, date)));
    }
    return placesOnDateCache.get(date);
  };
  const noteDate = (group, date) => {
    if (date && date > group.lastDate) group.lastDate = date;
  };

  (Array.isArray(photos) ? photos : []).forEach(photo => {
    if (!photo) return;
    const dates = Array.from(new Set((datesOf(photo) || []).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')))));
    const tagged = groups.filter(group => photoMatchesPlaceTag(photo, group.place));
    if (tagged.length) {
      tagged.forEach(group => {
        group.photos.push(photo);
        group.byTag += 1;
        dates.forEach(date => noteDate(group, date));
      });
      return;
    }
    // The date rule files photos TAKEN at a place, so it skips screenshots: maps, bookings and
    // chat captures shared that day are not photos of the place. A photo uploaded to the schedule
    // itself (일정 사진) counts even without camera EXIF. Tagged photos above always count.
    if (!isLikelyCameraPhoto(photo) && !isScheduleUpload(photo)) return;
    const candidates = new Map();
    dates.forEach(date => placesOnDate(date).forEach(group => candidates.set(group.key, group)));
    if (candidates.size === 1) {
      const group = candidates.values().next().value;
      group.photos.push(photo);
      group.byDate += 1;
      dates.filter(date => matchesDate(group.place, date)).forEach(date => noteDate(group, date));
      return;
    }
    if (candidates.size > 1) {
      const date = dates.find(d => placesOnDate(d).length > 1) || dates[0];
      if (!unclassifiedByDate.has(date)) {
        unclassifiedByDate.set(date, { date, candidates: placesOnDate(date).map(group => group.place), photos: [] });
      }
      unclassifiedByDate.get(date).photos.push(photo);
    }
  });

  const nonEmpty = groups
    .filter(group => group.photos.length)
    .sort((a, b) => (b.lastDate.localeCompare(a.lastDate)) || (b.photos.length - a.photos.length));
  const unclassified = Array.from(unclassifiedByDate.values()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return {
    groups: nonEmpty,
    unclassified,
    unclassifiedCount: unclassified.reduce((sum, bucket) => sum + bucket.photos.length, 0)
  };
}
