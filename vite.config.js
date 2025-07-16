import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ai-text-converter/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: { 
    open: true 
  }
});