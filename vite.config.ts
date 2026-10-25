import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// BASE_PATH is set by the GitHub Pages workflow to "/<repo-name>/".
// Locally it defaults to "/" so `npm run dev` works at the root.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // The Scout bot maintains /data; the site imports it directly at build time.
      '@data': fileURLToPath(new URL('./data', import.meta.url)),
    },
  },
});
