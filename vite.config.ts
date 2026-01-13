import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Using './' makes the build assets relative, which is the most compatible setting
  // for both Vercel (root) and GitHub Pages (subfolder) deployments.
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  // Define process.env for the browser as the Gemini SDK expects it.
  // This value is injected during the build process.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  server: {
    port: 3000,
    open: true,
  },
});