import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.VITE_BUILD_SHA ||= 'dev';

const mapVendorModule = id => (
  id.includes('/leaflet/')
  || id.includes('/leaflet.markercluster/')
  || id.includes('/maplibre-gl/')
  || id.includes('/@maplibre/')
  || id.includes('/@mapbox/')
  || id.includes('/@types/geojson/')
  || id.includes('/csscolorparser/')
  || id.includes('/earcut/')
  || id.includes('/geojson-vt/')
  || id.includes('/gl-matrix/')
  || id.includes('/grid-index/')
  || id.includes('/kdbush/')
  || id.includes('/murmurhash-js/')
  || id.includes('/pbf/')
  || id.includes('/potpack/')
  || id.includes('/quickselect/')
  || id.includes('/supercluster/')
  || id.includes('/tinyqueue/')
  || id.includes('/vt-pbf/')
  || id.includes('/@maplibre/maplibre-gl-style-spec/')
);

const chunkGroups = [
  { name: 'vendor-map', test: mapVendorModule, priority: 50 },
  { name: 'vendor-react-dom', test: id => id.includes('node_modules') && id.includes('react-dom'), priority: 45 },
  { name: 'vendor-react', test: id => id.includes('node_modules') && id.includes('react'), priority: 40 },
  { name: 'ui-admin', test: /[\\/]ui[\\/]ui-admin-/, priority: 35 },
  { name: 'ui-calendar-core', test: /[\\/]ui[\\/]ui-calendar-core/, priority: 35 },
  { name: 'ui-chat-room', test: /[\\/]ui[\\/]ui-chat-room/, priority: 35 },
  { name: 'ui-places', test: /[\\/]ui[\\/]ui-places/, priority: 35 },
  { name: 'ui-memo-view', test: /[\\/]ui[\\/]ui-memo-view/, priority: 35 },
  { name: 'ui-event-modals', test: /[\\/]ui[\\/]ui-event-modals/, priority: 35 },
  { name: 'ui-date-modal', test: /[\\/]ui[\\/]ui-date-modal/, priority: 35 },
  { name: 'app-write-queue', test: /[\\/]core[\\/]app-write-queue/, priority: 30 },
  { name: 'settlement-calculator', test: /[\\/]core[\\/]settlement-calculator/, priority: 30 },
  { name: 'app-domain-helpers', test: /[\\/]core[\\/]app-domain-helpers/, priority: 30 },
  { name: 'app-firebase-data', test: /[\\/]core[\\/]app-firebase-data/, priority: 30 },
  { name: 'photo-comments', test: /[\\/]core[\\/]photo-comments/, priority: 30 },
  { name: 'photo-comment-store', test: /[\\/]core[\\/]photo-comment-store/, priority: 30 },
  { name: 'gallery-data', test: /[\\/]core[\\/]gallery-data/, priority: 30 },
  { name: 'gallery-archive-state', test: /[\\/]core[\\/]gallery-archive-state/, priority: 30 },
  { name: 'photo-index', test: /[\\/]core[\\/]photo-index/, priority: 30 },
  { name: 'notification-pwa-state', test: /[\\/]core[\\/]notification-pwa-state/, priority: 30 },
  { name: 'app-data-bootstrap', test: /[\\/]core[\\/]app-data-bootstrap/, priority: 30 },
  { name: 'app-shell-state', test: /[\\/]core[\\/]app-shell-state/, priority: 30 },
  { name: 'app-main', test: /[\\/]core[\\/]app-main/, priority: 20 },
  { name: 'vendor', test: /node_modules/, priority: 10 }
];

export default defineConfig({
  plugins: [react()],
  // PR previews (see .github/workflows/pr-preview.yml) live under a per-PR subpath on the same
  // Pages site (/calendar/pr-preview/pr-<n>/) rather than the site root, so they set their own
  // base explicitly; production keeps building with the fixed /calendar/ root it always has.
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES === '1' ? '/calendar/' : './'),
  root: path.resolve(__dirname, 'src'),
  publicDir: path.resolve(__dirname, 'public-vite'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    // Vite 8 raised its default browser baseline. Keep the wider compatibility contract the
    // existing service already supported instead of silently dropping older iOS/webviews.
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2
      }
    },
    cssCodeSplit: true,
    rolldownOptions: {
      checks: {
        // Terser is intentionally used for the production size contract; its render hook is
        // expected to dominate this small build, so Rolldown's timing notice is only noise.
        pluginTimings: false
      },
      output: {
        // Vite 8 uses Rolldown. Keep dependencies out of a matched group's chunk so a small
        // coordinator never drags lazy screens back into the startup graph.
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: chunkGroups
        }
      }
    },
    // vendor-map (Leaflet + MapLibre 6, ~1.2MB) plus its dedicated worker chunk are the
    // only pieces near this limit, and they're already lazy-loaded only when the 장소 map
    // view opens (import('leaflet') / import('maplibre-gl') inside loadLeaflet()).
    // Raised from 1200 to 1300 after the MapLibre 6.9 security bump so the known lazy
    // chunk stops reprinting a build-log warning, while still catching a genuine
    // regression -- any *other* chunk crossing 700KB-1300KB is exactly the kind of
    // accidental eager-bundle growth this limit exists to catch.
    chunkSizeWarningLimit: 1300
  }
});
