import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Asset base path. Served from slabd.app, a custom domain, which serves
// from the root — so assets are requested from '/'. It was '/slabd/' while
// the site lived on the github.io project-site subdirectory; keep this in
// step with public/CNAME, since removing the custom domain would send it
// back to a subdirectory and every asset would 404.
const base = process.env.SLABD_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
