import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {

    }
  },
  css: {
    preprocessorOptions: {
      scss: {
      }
    }
  },
  server: {
    host: '192.168.1.20',
    port: 4000,
  }
});
