import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      // Proxy GitHub archive downloads to avoid CORS during local dev
      '/gh/': {
        target: 'https://codeload.github.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gh\//, '/'),
        secure: true,
      },
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Exclude packages that rely on ESM-only or browser-specific envs from pre-bundling
    exclude: ['lucide-react', '@webcontainer/api'],
  },
});
