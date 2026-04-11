import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  // appType: 'mpa', // Removed 'mpa' to allow React Router Single-Page Application features to function!
  plugins: [react(), tailwindcss()],
})
