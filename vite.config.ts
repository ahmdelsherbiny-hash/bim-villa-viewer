import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Ensures assets load properly on GitHub Pages subpaths
  server: {
    port: 3000,
    open: true
  }
});
