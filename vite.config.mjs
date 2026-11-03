import { defineConfig } from 'vite';
import { join } from 'node:path';
import { ROOT } from './scripts/lib/files.mjs';
import { websitePlugin } from './scripts/vite-website.mjs';

export default defineConfig({
  root: join(ROOT, 'apps/website'),
  appType: 'mpa',
  publicDir: false,
  plugins: [websitePlugin()],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT || 4173),
    strictPort: true
  }
});
