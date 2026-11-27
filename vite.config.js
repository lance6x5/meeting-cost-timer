import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base must match the GitHub Pages repo path.
export default defineConfig({
  base: '/meeting-cost-timer/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Meeting Cost Timer',
        short_name: 'MeetingCost',
        description: 'A live ticker showing how much a meeting is costing in real time.',
        start_url: '/meeting-cost-timer/',
        scope: '/meeting-cost-timer/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#16a34a',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}']
      }
    })
  ],
  test: {
    environment: 'node'
  }
});
