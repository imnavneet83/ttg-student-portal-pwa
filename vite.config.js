import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'TTG Student Portal',
        short_name: 'TTG Portal',
        description: 'The Toppers Gurukul Student Portal',

        theme_color: '#007c91',
        background_color: '#ffffff',

        display: 'standalone',
scope: '/',
start_url: '/',

        icons: [
  {
    src: '/icon-192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any maskable'
  },
  {
    src: '/icon-512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any maskable'
  }
]
      }
    })
  ]
})