'use strict';
// GPS on photoIndex rows (보관함 > 장소). Current clients store per-photo coordinates atomically on
// the message as imageGeoMap (older clients may use a follow-up compatibility write); getPhotoIndexEntries
// copies them onto each owner entry and syncCanonicalPhotoIndex puts them on the canonical row.

function isIndexGeoPair(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    && !(lat === 0 && lng === 0);
}

// Coordinates for one asset from a source document's imageGeoMap, or null.
function readImageGeo(data, assetKey) {
  const geo = data && data.imageGeoMap && typeof data.imageGeoMap === 'object' ? data.imageGeoMap[assetKey] : null;
  const lat = Number(geo && geo.lat);
  const lng = Number(geo && geo.lng);
  return isIndexGeoPair(lat, lng) ? { latitude: lat, longitude: lng } : null;
}

// GPS for the canonical row: from any owner that carries it (the selected owner may be another
// copy of the same asset that never had coordinates), else kept from the existing row. The latter
// preserves a coordinate written by an older client in a follow-up update if event delivery races.
function pickPhotoIndexGeo(owners, existing) {
  const withGeo = (owners || []).find(owner => isIndexGeoPair(Number(owner && owner.latitude), Number(owner && owner.longitude)));
  if (withGeo) return { latitude: Number(withGeo.latitude), longitude: Number(withGeo.longitude) };
  const lat = Number(existing && existing.latitude);
  const lng = Number(existing && existing.longitude);
  return isIndexGeoPair(lat, lng) ? { latitude: lat, longitude: lng } : {};
}

module.exports = { isIndexGeoPair, readImageGeo, pickPhotoIndexGeo };
