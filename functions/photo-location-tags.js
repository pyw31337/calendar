'use strict';

// Server-side counterpart to the browser's photo-metadata-tags module. It only turns coordinates
// supplied by the uploader into administrative-area hashtags; it never infers a location from
// image pixels, filenames, or a meeting's venue.

function cleanLocationName(value) {
  return String(value || '')
    .replace(/^#+/, '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function addTag(tags, value) {
  const name = cleanLocationName(value);
  if (!name) return;
  const tag = `#${name}`;
  if (!tags.includes(tag)) tags.push(tag);
}

function buildKakaoLocationTags(document) {
  const road = document?.road_address && typeof document.road_address === 'object' ? document.road_address : {};
  const address = document?.address && typeof document.address === 'object' ? document.address : {};
  const tags = [];
  // Kakao can omit road-address data. Its parcel address exposes the same administrative fields,
  // so preserve province/city/dong with a field-level fallback.
  addTag(tags, road.region_1depth_name || address.region_1depth_name);
  addTag(tags, road.region_2depth_name || address.region_2depth_name);
  addTag(tags, road.region_3depth_name || address.region_3depth_name);
  return tags.slice(0, 5);
}

function tokenizeHashtags(value) {
  return new Set((String(value || '').match(/#[^\s#]+/g) || []).map(tag => tag.trim()));
}

function appendLocationTags(existing, locationTags) {
  const current = String(existing || '').trim();
  const existingTags = tokenizeHashtags(current);
  const additions = (Array.isArray(locationTags) ? locationTags : [])
    .map(tag => `#${cleanLocationName(tag)}`)
    .filter(tag => tag !== '#' && !existingTags.has(tag));
  return additions.length ? [current, ...additions].filter(Boolean).join(' ').trim().slice(0, 640) : current;
}

module.exports = { buildKakaoLocationTags, appendLocationTags };
