import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Force using localhost for dev server (prevents Vite exposing LAN IP by default)
    host: 'localhost',
  },
  build: {
    // Optimisation du code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks pour les dépendances volumineuses
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/functions'],
          'ui-vendor': ['lucide-react', 'zustand'],
        },
      },
    },
    // Chunk size warnings (augmentation pour éviter warnings sur gros chunks)
    chunkSizeWarningLimit: 1000,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Suppression des console.log en production
      },
    },
  },
})
