import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load biến môi trường từ file .env
dotenv.config();

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Thư mục xuất ra sau khi build
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
  server: {
    port: process.env.PORT || 3000,  // Sử dụng port từ biến môi trường nếu có
    proxy: {
      '/api': {
        target: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000', // URL của Django backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
