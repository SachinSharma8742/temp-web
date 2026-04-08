import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  // Treat dev server as a multi‑page app so unknown paths (e.g. /temp-web) 404 instead of falling back to index.html.
  appType: 'mpa',
  plugins: [react(), tailwindcss()],
})
