import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' (without a prompt UI) applies updates on the next launch, so
      // the page never reloads by itself and wipes a calculation in progress.
      registerType: 'prompt',
      injectRegister: 'script-defer',
      includeAssets: ['apple-touch-icon.png', 'legal.html'],
      manifest: {
        name: 'Galley Manager Pro',
        short_name: 'Galley Pro',
        description: 'Meal distribution calculator for cabin crew',
        theme_color: '#f5f0e8',
        background_color: '#f3ede2',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        // Non-Latin font subsets are loaded on demand instead
        globIgnores: ['**/*-vietnamese-*', '**/*-latin-ext-*'],
        // Vercel's own endpoints must always go to the network
        navigateFallbackDenylist: [/^\/_vercel\//],
      },
    }),
  ],
})
