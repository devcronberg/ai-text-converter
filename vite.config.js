import { defineConfig } from 'vite';

export default defineConfig({
  base: '/text-converter-app/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: { 
    open: true 
  }
});