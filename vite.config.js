import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Force using localhost for dev server (prevents Vite exposing LAN IP by default)
    host: 'localhost',
  },
})
