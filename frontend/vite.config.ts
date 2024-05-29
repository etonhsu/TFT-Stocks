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
  }
})

