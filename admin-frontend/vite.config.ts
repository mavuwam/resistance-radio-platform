import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://a8tj7xh4qi.execute-api.us-east-1.amazonaws.com/dev',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
      },
    },
  },
  resolve: {
    alias: {
      shared: path.resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          sentry: ['@sentry/react'],
        },
      },
    },
  },
});
