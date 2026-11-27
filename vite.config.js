import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// base must match the GitHub Pages repo path.
export default defineConfig({
  base: '/meeting-cost-timer/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.svg', 'logo-mark.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Burnrate - Meeting Cost Timer',
        short_name: 'Burnrate',
        description: 'Burnrate: every minute has a price tag. A live ticker showing how much a meeting is costing in real time.',
        start_url: '/meeting-cost-timer/',
        scope: '/meeting-cost-timer/',
        display: 'standalone',
        background_color: '#1c0f08',
        theme_color: '#c2410c',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        // Never cache or intercept the anonymous visit counter.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://abacus.jasoncameron.dev',
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  test: {
    environment: 'node'
  }
});
