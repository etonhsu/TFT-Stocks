import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['chunk-HKLPI2XQ', 'chunk-YI7ZP7WZ']
  }
});