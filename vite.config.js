import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3004,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/avatars': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/run-photos': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
