import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo_minane_cargo.png'],
      manifest: {
        name: 'Minane Cargo Facturation',
        short_name: 'Factures',
        description: 'Application de facturation pour Minane Cargo',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo_minane_cargo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo_minane_cargo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
