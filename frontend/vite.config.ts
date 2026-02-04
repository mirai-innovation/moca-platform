import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // escucha en 0.0.0.0 para el túnel
    allowedHosts: true, // permite cualquier host (p. ej. *.trycloudflare.com)
  },
})
