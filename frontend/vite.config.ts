import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['recharts'],
  }},
  optimizeDeps: {
    exclude: ['chunk-HKLPI2XQ', 'chunk-YI7ZP7WZ']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/riot.txt': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

