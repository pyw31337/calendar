/**
 * Per-photo GPS coordinates, kept on the message as `imageGeoMap: { <assetKey>: { lat, lng } }`
 * (asset-keyed like imageTagMap, so they survive deleting/reordering neighbouring photos). The
 * server copies them onto photoIndex rows (functions/index.js getPhotoIndexEntries) and 보관함 >
 * 장소 files a photo under the registered place it was taken at -- including places registered
 * after the upload, which the upload-time place tag cannot cover.
 *
 * Coordinates are written as a separate, best-effort update AFTER the message itself is saved: a
 * client that runs before the matching firestore.rules deploy then only loses the coordinates,
 * never the upload.
 */
import { canonicalPhotoAssetKey } from './photo-asset.js';

const MAX_GEO_ENTRIES = 50;

function roundCoord(value) {
  return Math.round(Number(value) * 1e5) / 1e5;
}

export function isValidCoordinatePair(lat, lng) {
  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b)
    && a >= -90 && a <= 90 && b >= -180 && b <= 180
    && !(a === 0 && b === 0);
}

// images: the resolved upload entries ({ imageUrl, thumbUrl, metadata: { latitude, longitude } }).
export function buildImageGeoMap(images) {
  const map = {};
  (Array.isArray(images) ? images : []).forEach(image => {
    const lat = image?.metadata?.latitude;
    const lng = image?.metadata?.longitude;
    if (!isValidCoordinatePair(lat, lng)) return;
    const key = canonicalPhotoAssetKey({ imageUrl: image.imageUrl, thumbUrl: image.thumbUrl });
    if (!key || Object.prototype.hasOwnProperty.call(map, key) || Object.keys(map).length >= MAX_GEO_ENTRIES) return;
    map[key] = { lat: roundCoord(lat), lng: roundCoord(lng) };
  });
  return map;
}

export async function persistImageGeoMap({ db, calendarId, collection = 'messages', docId, geoMap }) {
  if (!db || !calendarId || !docId || !geoMap || !Object.keys(geoMap).length) return false;
  try {
    await db.collection('calendars').doc(`cal_${calendarId}`).collection(collection).doc(docId).update({ imageGeoMap: geoMap });
    return true;
  } catch (err) {
    // Rules not deployed yet, offline, or the message was removed meanwhile: coordinates are an
    // enhancement, so never retry-queue them or surface an error for them.
    try { console.warn('[photo-geo] coordinates not saved:', err && (err.code || err.message)); } catch (_) {}
    return false;
  }
}
