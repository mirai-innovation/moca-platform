import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Destino del backend para el proxy de desarrollo (NestJS local).
const BACKEND_TARGET = process.env.BACKEND_URL || 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // escucha en 0.0.0.0 para el túnel
    allowedHosts: true, // permite cualquier host (p. ej. *.trycloudflare.com)
    // El frontend llama a /api/* (mismo origen) y Vite lo reenvía al backend.
    // Así, al servir por HTTPS (túnel), no hay "mixed content" y el micrófono funciona.
    proxy: {
      '/api': {
        target: BACKEND_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
