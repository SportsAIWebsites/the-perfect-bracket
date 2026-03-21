import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/espn': {
        target: 'https://site.api.espn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/espn/, ''),
      },
      '/api/bracket': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/odds': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/analyze': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/game': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
