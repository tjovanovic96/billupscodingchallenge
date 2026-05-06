import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/play':       { target: 'http://localhost:5249', changeOrigin: true },
      '/scoreboard': { target: 'http://localhost:5249', changeOrigin: true },
      '/choices':    { target: 'http://localhost:5249', changeOrigin: true },
      '/choice':     { target: 'http://localhost:5249', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
