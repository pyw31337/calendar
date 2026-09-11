// Keep all map libraries in Vite's own lazy chunks. They are fetched from the same origin only
// after somebody opens the places map, so a slow/filtered network cannot break the rest of the
// app and the map no longer depends on unpkg/jsDelivr being reachable at runtime.
let leafletLoadPromise = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadPromise) return leafletLoadPromise;
  leafletLoadPromise = (async () => {
    const [leafletModule] = await Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css')
    ]);
    const L = leafletModule.default || leafletModule;
    window.L = L;
    return L;
  })().catch(err => {
    leafletLoadPromise = null;
    throw err;
  });
  return leafletLoadPromise;
}

// Marker clustering (leaflet.markercluster) -- with dozens/hundreds of places (e.g. an imported
// travel log), rendering every pin as its own live DOM marker makes Leaflet's pan/zoom repaint
// visibly janky since it repositions every marker element on every animation frame. Grouping
// nearby pins into a single cluster badge that only splits apart once you zoom in keeps the
// number of on-screen marker elements small regardless of how many places are registered.
// Best-effort: if this plugin fails to load, the map still works with ungrouped markers (see the
// clusterAvailable fallback in PlaceMapView below) rather than failing the whole map.
let leafletMarkerClusterLoadPromise = null;
function loadLeafletMarkerCluster() {
  if (window.L && window.L.markerClusterGroup) return Promise.resolve();
  if (leafletMarkerClusterLoadPromise) return leafletMarkerClusterLoadPromise;
  leafletMarkerClusterLoadPromise = (async () => {
    await loadLeaflet();
    await Promise.all([
      import('leaflet.markercluster'),
      import('leaflet.markercluster/dist/MarkerCluster.css')
    ]);
    if (!window.L.markerClusterGroup) throw new Error('leaflet.markercluster loaded without markerClusterGroup');
  })().catch(err => {
    leafletMarkerClusterLoadPromise = null;
    throw err;
  });
  return leafletMarkerClusterLoadPromise;
}

let mapLibreLeafletLoadPromise = null;
function loadMapLibreLeaflet() {
  if (window.L && window.L.maplibreGL) return Promise.resolve(window.L);
  if (mapLibreLeafletLoadPromise) return mapLibreLeafletLoadPromise;
  mapLibreLeafletLoadPromise = (async () => {
    const L = await loadLeaflet();
    // MapLibre GL JS 6 is ESM-only. 6.4.1+ patches GHSA-jrc7-96c5-q579 (CVE-2026-85061).
    // The Leaflet bridge ESM build imports maplibre-gl itself and assigns L.maplibreGL.
    const [mapLibreModule, , leafletBridge] = await Promise.all([
      import('maplibre-gl'),
      import('maplibre-gl/dist/maplibre-gl.css'),
      import('@maplibre/maplibre-gl-leaflet')
    ]);
    if (typeof mapLibreModule.setWorkerUrl === 'function') {
      try {
        const workerUrlMod = await import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url');
        if (workerUrlMod?.default) mapLibreModule.setWorkerUrl(workerUrlMod.default);
      } catch (_) { /* Vite can still resolve the worker via import.meta.url */ }
    }
    window.maplibregl = mapLibreModule;
    const maplibreGL = leafletBridge.maplibreGL || leafletBridge.default;
    if (!L.maplibreGL && typeof maplibreGL === 'function') L.maplibreGL = maplibreGL;
    if (leafletBridge.MaplibreGL && !L.MaplibreGL) L.MaplibreGL = leafletBridge.MaplibreGL;
    if (!L.maplibreGL) throw new Error('MapLibre Leaflet bridge loaded without maplibreGL');
    return L;
  })().catch(err => {
    mapLibreLeafletLoadPromise = null;
    throw err;
  });
  return mapLibreLeafletLoadPromise;
}

// Small monochrome (white, via stroke="#fff") lucide-style glyph per category id. Each icon is
// stored as an array of shape descriptors -- { tag: 'path', d } / { tag: 'rect', ... } /
// { tag: 'circle', ... } -- rather than just path "d" strings, since several of these icons (예:
// dices, hotel, shopping-cart) mix <rect>/<circle> primitives with <path>. One shared definition
// drives both a Leaflet divIcon HTML string (markers render outside React's tree, so those can't
// use a React icon component) AND a real React <PlaceCategoryMarkerIcon> element (used inline in
// the place list, see PlacesView) without keeping two copies in sync by hand. Every built-in
// category id (including 기타/etc) has its own pictogram now; a custom category id an admin adds
// beyond these falls back to the 기타 icon rather than guessing at one.
const PLACE_CATEGORY_MARKER_SHAPES = {
  // Soup (lucide "soup") -- 식당/restaurant
  restaurant: [
    { tag: 'path', d: 'M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z' },
    { tag: 'path', d: 'M7 21h10' },
    { tag: 'path', d: 'M19.5 12 22 6' },
    { tag: 'path', d: 'M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62' },
    { tag: 'path', d: 'M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62' },
    { tag: 'path', d: 'M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62' }
  ],
  cafe: [
    { tag: 'path', d: 'M4 8h12v6a4 4 0 0 1 -4 4h-4a4 4 0 0 1 -4 -4v-6z' },
    { tag: 'path', d: 'M16 9h2a2 2 0 0 1 0 4h-2' },
    { tag: 'path', d: 'M8 2c-.6 1 .6 1.5 0 2.5' },
    { tag: 'path', d: 'M12 2c-.6 1 .6 1.5 0 2.5' }
  ],
  // Dices (lucide "dices") -- 놀이/play
  play: [
    { tag: 'rect', width: '12', height: '12', x: '2', y: '10', rx: '2', ry: '2' },
    { tag: 'path', d: 'm17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6' },
    { tag: 'path', d: 'M6 18h.01' },
    { tag: 'path', d: 'M10 14h.01' },
    { tag: 'path', d: 'M15 6h.01' },
    { tag: 'path', d: 'M18 9h.01' }
  ],
  // Hotel (lucide "hotel") -- 숙박/lodging
  lodging: [
    { tag: 'path', d: 'M10 22v-6.57' },
    { tag: 'path', d: 'M12 11h.01' },
    { tag: 'path', d: 'M12 7h.01' },
    { tag: 'path', d: 'M14 15.43V22' },
    { tag: 'path', d: 'M15 16a5 5 0 0 0-6 0' },
    { tag: 'path', d: 'M16 11h.01' },
    { tag: 'path', d: 'M16 7h.01' },
    { tag: 'path', d: 'M8 11h.01' },
    { tag: 'path', d: 'M8 7h.01' },
    { tag: 'rect', x: '4', y: '2', width: '16', height: '20', rx: '2' }
  ],
  // ShoppingCart (lucide "shopping-cart") -- 쇼핑/shopping
  shopping: [
    { tag: 'circle', cx: '8', cy: '21', r: '1' },
    { tag: 'circle', cx: '19', cy: '21', r: '1' },
    { tag: 'path', d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' }
  ],
  // MessageCircleMore (lucide "message-circle-more") -- 기타/etc, and the fallback for any
  // custom category id that doesn't match one of the above.
  etc: [
    { tag: 'path', d: 'M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719' },
    { tag: 'path', d: 'M8 12h.01' },
    { tag: 'path', d: 'M12 12h.01' },
    { tag: 'path', d: 'M16 12h.01' }
  ]
};
// Returns { shapes: [...] } for the marker's inner content -- an unrecognized/custom category id
// falls back to the 기타 pictogram rather than a plain emoji.
function getPlaceCategoryMarkerContent(category) {
  const id = String(category?.id || '').toLowerCase();
  return { shapes: PLACE_CATEGORY_MARKER_SHAPES[id] || PLACE_CATEGORY_MARKER_SHAPES.etc };
}
function placeMarkerShapeToHtml(shape) {
  if (shape.tag === 'rect') return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}"${shape.rx ? ` rx="${shape.rx}"` : ''}${shape.ry ? ` ry="${shape.ry}"` : ''} />`;
  if (shape.tag === 'circle') return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" />`;
  return `<path d="${shape.d}" />`;
}
// Marker circle/icon dimensions, shared by buildPlaceMarkerHtml and every L.divIcon iconSize
// below them so the two never drift out of sync with each other.
const PLACE_MARKER_SIZE = 34;
const PLACE_MARKER_ICON_SIZE = 18;
// Shared by both a normal individual marker AND a cluster badge that's collapsed down to a
// single child (see iconCreateFunction below) -- a cluster with only one marker left inside it
// should look identical to that marker on its own, not like a numbered cluster.
function buildPlaceMarkerHtml(category, visitStatus = 'visited') {
  const color = category ? category.color : '#64748B';
  const content = getPlaceCategoryMarkerContent(category);
  const isPlanned = visitStatus === 'planned';
  const bgColor = isPlanned ? '#FFFFFF' : color;
  const strokeColor = isPlanned ? color : '#fff';
  const borderColor = isPlanned ? color : '#fff';
  const innerHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${PLACE_MARKER_ICON_SIZE}" height="${PLACE_MARKER_ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content.shapes.map(placeMarkerShapeToHtml).join('')}</svg>`;
  return `<div style="width:${PLACE_MARKER_SIZE}px;height:${PLACE_MARKER_SIZE}px;border-radius:50%;background:${bgColor};border:2px solid ${borderColor};box-shadow:0 1px 3px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;box-sizing:border-box;">${innerHtml}</div>`;
}
// React version of the same badge -- a small solid-color circle with the category's white line
// icon inside, matching the map marker exactly. Used in the place list (PlacesView) so its
// category badge looks like a miniature of the actual pin instead of a plain emoji.


// Renders an interactive Leaflet/OSM map with one pin per registered place, auto-fit to bounds
// so every pin stays visible. Popup content is built via DOM nodes (not HTML string
// interpolation) since place name/address/memo are free-text user input -- only the marker's
// divIcon HTML interpolates category.color (hex-validated by normalizeColorValue) and its icon
// (a fixed emoji from a controlled lookup table), never raw user text, so that stays safe as a
// string template.

// Shared by panMapToFitMarkerPopup and centerMapOnMarkerAndPopup below: the on-screen rect of
// the marker icon plus its open popup (if any), unioned into one box -- "the marker+popup as one
// visual chunk" that both functions position relative to the map container.
function getMarkerPopupUnionRect(marker) {
  const markerEl = marker && marker.getElement && marker.getElement();
  if (!markerEl) return null;
  const markerRect = markerEl.getBoundingClientRect();
  const popup = marker.getPopup && marker.getPopup();
  const popupEl = popup && popup.isOpen && popup.isOpen() && popup.getElement && popup.getElement();
  if (!popupEl) return markerRect;
  const popupRect = popupEl.getBoundingClientRect();
  const left = Math.min(markerRect.left, popupRect.left);
  const top = Math.min(markerRect.top, popupRect.top);
  const right = Math.max(markerRect.right, popupRect.right);
  const bottom = Math.max(markerRect.bottom, popupRect.bottom);
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

// After opening a Leaflet popup, pan just enough to keep the full popup+marker inside the map
// pane -- a minimal nudge, not a re-center, so clicking a marker that's already on screen doesn't
// jump the view around. Previous panBy([0, -h]) pushed the pin toward the bottom edge on desktop,
// clipping tall visit-history popups under the map grip / category tabs.
function panMapToFitMarkerPopup(map, marker, opts) {
  if (!map || !marker) return;
  const pad = (opts && opts.pad) || 16;
  const tryPan = () => {
    if (!map || !map.getContainer()) return;
    const unionRect = getMarkerPopupUnionRect(marker);
    if (!unionRect) return;
    const mapRect = map.getContainer().getBoundingClientRect();
    if (mapRect.height <= 0 || mapRect.width <= 0) return;
    let dx = 0;
    let dy = 0;
    // If the chunk is taller than or close to map height, anchor top to top + pad and stop bouncing
    if (unionRect.height >= mapRect.height - pad * 2) {
      if (unionRect.top < mapRect.top + pad) {
        dy = unionRect.top - (mapRect.top + pad);
      }
    } else {
      if (unionRect.top < mapRect.top + pad) {
        dy = unionRect.top - (mapRect.top + pad);
      } else if (unionRect.bottom > mapRect.bottom - pad) {
        dy = unionRect.bottom - (mapRect.bottom - pad);
      }
    }
    if (unionRect.left < mapRect.left + pad) {
      dx = unionRect.left - (mapRect.left + pad);
    } else if (unionRect.right > mapRect.right - pad) {
      dx = unionRect.right - (mapRect.right - pad);
    }
    // Limit max single pan shift to 35% of map container height to prevent pushing marker off screen
    const maxShiftY = mapRect.height * 0.35;
    dy = Math.max(-maxShiftY, Math.min(maxShiftY, dy));
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      map.panBy([dx, dy], { animate: opts && opts.animate !== false });
    }
  };
  requestAnimationFrame(() => requestAnimationFrame(tryPan));
}

// Deliberate jump-to-place navigation (picking a row in the place list): unlike the minimal nudge
// above, this always re-centers so the marker+popup chunk -- as one combined block, not just the
// marker's own point -- lands in the middle of the map pane, regardless of where it happened to
// render after the zoom/pan that opened the popup.
function centerMapOnMarkerAndPopup(map, marker, opts) {
  if (!map || !marker) return;
  const tryCenter = () => {
    if (!map || !map.getContainer()) return;
    const unionRect = getMarkerPopupUnionRect(marker);
    if (!unionRect) return;
    const mapRect = map.getContainer().getBoundingClientRect();
    if (mapRect.height <= 0 || mapRect.width <= 0) return;
    const unionCenterX = (unionRect.left + unionRect.right) / 2;
    const unionCenterY = (unionRect.top + unionRect.bottom) / 2;
    const mapCenterX = mapRect.left + mapRect.width / 2;
    const mapCenterY = mapRect.top + mapRect.height / 2;
    const dx = unionCenterX - mapCenterX;
    const dy = unionCenterY - mapCenterY;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      map.panBy([dx, dy], { animate: opts && opts.animate !== false });
    }
  };
  requestAnimationFrame(() => requestAnimationFrame(tryCenter));
}

export {
  loadLeaflet,
  loadLeafletMarkerCluster,
  loadMapLibreLeaflet,
  getPlaceCategoryMarkerContent,
  placeMarkerShapeToHtml,
  buildPlaceMarkerHtml,
  getMarkerPopupUnionRect,
  panMapToFitMarkerPopup,
  centerMapOnMarkerAndPopup
};
