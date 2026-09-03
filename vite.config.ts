import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Served from a custom domain (slabd.app) at the root, so no repo-name
  // base path. See public/CNAME.
  base: '/',
  plugins: [react(), tailwindcss()],
})
