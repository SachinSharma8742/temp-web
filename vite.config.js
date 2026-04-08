import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  // Disable SPA fallback so unknown paths (e.g., /temp-web) return 404 in dev/preview.
  appType: 'mpa',
  plugins: [react(), tailwindcss()],
})
