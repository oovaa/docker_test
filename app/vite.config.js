import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/getall': { target: 'http://localhost:3355', changeOrigin: true },
      '/getVal': { target: 'http://localhost:3355', changeOrigin: true },
      '/setVal': { target: 'http://localhost:3355', changeOrigin: true },
      '/deleteV': { target: 'http://localhost:3355', changeOrigin: true },
    },
  },
})
