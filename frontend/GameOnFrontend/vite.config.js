import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand-logo.png'],
      manifest: {
        name: 'GameOn',
        short_name: 'GameOn',
        description: 'Track, review and discover games',
        theme_color: '#dc1e3c',
        background_color: '#0a0608',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/dashboard',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      screenshots: [
        {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'GameOn Dashboard',
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'GameOn Mobile',
          },
        ],
      workbox: {
        // Cache the app shell (JS, CSS, fonts)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Don't cache API calls — let them go through normally
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Proxied RAWG images served by backend
            urlPattern: /\/games\/image-proxy\?url=.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'game-image-proxy-cache',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})