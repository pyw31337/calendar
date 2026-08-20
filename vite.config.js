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
          if (
            id.includes('/ui/ui-memo-view') ||
            id.includes('/ui/ui-chat-room') ||
            id.includes('/ui/ui-places') ||
            id.includes('/ui/ui-date-modal') ||
            id.includes('/ui/ui-event-modals') ||
            id.includes('/ui/ui-calendar-core')
          ) return 'ui-views';
          if (id.includes('/core/app-main')) return 'app-main';
        }
      }
    },
    chunkSizeWarningLimit: 700
  }
});
