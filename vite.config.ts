import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Asset base path. GitHub Pages serves a project site from a subdirectory
// (/slabd/), so assets have to be requested from there — with a root base
// the built HTML asks for /assets/… and gets a 404, leaving a blank page.
//
// Once slabd.app is pointed at Pages this becomes '/' and public/CNAME
// comes back, because a custom domain serves from the root instead. Driven
// by an env var so that switch is a one-line change in the workflow rather
// than a code edit.
const base = process.env.SLABD_BASE ?? '/slabd/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
