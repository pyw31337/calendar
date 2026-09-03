import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === '1' ? '/calendar/' : './',
  root: path.resolve(__dirname, 'src'),
  publicDir: path.resolve(__dirname, 'public-vite'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2
      }
    },
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Leaflet/MapLibre are only needed by the places map. Keep their sizeable renderer,
            // bridge and CSS in a lazy chunk so calendar/chat/memo startup never pays for maps.
            if (
              id.includes('/leaflet/') ||
              id.includes('/leaflet.markercluster/') ||
              id.includes('/maplibre-gl/') ||
              id.includes('/@maplibre/') ||
              id.includes('/@mapbox/') ||
              id.includes('/@types/geojson/') ||
              id.includes('/csscolorparser/') ||
              id.includes('/earcut/') ||
              id.includes('/geojson-vt/') ||
              id.includes('/gl-matrix/') ||
              id.includes('/grid-index/') ||
              id.includes('/kdbush/') ||
              id.includes('/murmurhash-js/') ||
              id.includes('/pbf/') ||
              id.includes('/potpack/') ||
              id.includes('/quickselect/') ||
              id.includes('/supercluster/') ||
              id.includes('/tinyqueue/') ||
              id.includes('/vt-pbf/') ||
              id.includes('/@maplibre/maplibre-gl-style-spec/')
            ) return 'vendor-map';
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor';
          }
          if (id.includes('/ui/ui-admin-')) return 'ui-admin';
          // Split what used to be one 'ui-views' chunk in two once it crept up near the
          // per-chunk size budget (check:dist-budget) -- these 6 files are all awaited together
          // in the same boot-time Promise.all (src/main.jsx), never lazy-loaded independently,
          // so splitting them doesn't change what downloads or when; it only keeps each output
          // file comfortably under its own budget instead of one chunk absorbing all 6 files'
          // combined growth.
          if (
            id.includes('/ui/ui-calendar-core') ||
            id.includes('/ui/ui-chat-room') ||
            id.includes('/ui/ui-places')
          ) return 'ui-views-calendar';
          if (
            id.includes('/ui/ui-memo-view') ||
            id.includes('/ui/ui-event-modals')
          ) return 'ui-views-modals';
          if (id.includes('/ui/ui-date-modal')) return 'ui-date-modal';
          // app-domain-helpers/app-firebase-data are only ever imported by app-main.js, but each
          // is given its own chunk explicitly (Rollup's default heuristic would otherwise inline
          // a single-importer module straight back into its importer's chunk) so splitting them
          // out of app-main.js actually shrinks the app-main chunk instead of just reorganizing
          // its source internally.
          if (id.includes('/core/app-domain-helpers')) return 'app-domain-helpers';
          if (id.includes('/core/app-firebase-data')) return 'app-firebase-data';
          if (id.includes('/core/app-main')) return 'app-main';
        }
      }
    },
    // vendor-map (Leaflet + MapLibre, ~1.1MB) is the only chunk anywhere near this limit, and
    // it's already lazy-loaded only when the 장소 map view opens (import('leaflet') inside
    // loadLeaflet(), no static reference from index.html -- verified 2026-09-03, see
    // docs/ops-runbook.md). Raised from 700 to 1200 so that known, already-lazy chunk stops
    // printing a build-log warning every single build, while still catching a genuine
    // regression -- any *other* chunk crossing 700KB-1200KB (none currently do; the next
    // largest is app-main.js at ~240KB) is exactly the kind of accidental eager-bundle growth
    // this limit exists to catch.
    chunkSizeWarningLimit: 1200
  }
});
