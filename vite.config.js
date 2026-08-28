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
    chunkSizeWarningLimit: 700
  }
});
