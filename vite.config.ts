import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA, ManifestOptions } from 'vite-plugin-pwa';
import path from 'path';
import manifest from './public/manifest.json';

export default defineConfig({
  base: '/wordy-game/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: manifest as Partial<ManifestOptions>,
      workbox: {
        navigateFallback: '/wordy-game/index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});