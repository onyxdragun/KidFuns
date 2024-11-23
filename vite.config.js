import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {

  console.log("Mode: ", mode);
  dotenv.config({path: `.env.${mode}`});

  const host = process.env.VITE_HOST || '192.168.1.20';
  const port = parseInt(process.env.VITE_PORT) || 4000;
  const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://192.168.1.20:3000'

  return {
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
      host: host,
      port: parseInt(port),
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
