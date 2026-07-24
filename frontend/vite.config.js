import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Build optimizations for production
  build: {
    // Increase chunk size warning limit (AdminDashboard is legitimately large)
    chunkSizeWarningLimit: 700,
    // Minify with esbuild (default, fastest)
    minify: 'esbuild',
    // Target modern browsers for smaller/faster output
    target: 'es2020',
    rollupOptions: {
      output: {
        // Manual chunk splitting to prevent one huge bundle
        manualChunks: {
          // React core in its own chunk — cached across deploys
          'react-vendor': ['react', 'react-dom'],
          // Routing in its own chunk
          'router': ['react-router-dom'],
          // Animation library in its own chunk
          'motion': ['framer-motion'],
          // Icons in its own chunk (largest dependency)
          'icons': ['react-icons'],
          // PDF generation (only used in admin) in its own chunk
          'pdf': ['html2canvas', 'jspdf'],
          // HTTP client
          'axios': ['axios'],
        },
      },
    },
  },

  // Development server config
  server: {
    port: 3000,
    allowedHosts: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => console.log('proxy error', err));
        }
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
