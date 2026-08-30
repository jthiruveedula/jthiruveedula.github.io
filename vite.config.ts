import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages user site (jthiruveedula.github.io) serves from the domain root,
// and the Deploy workflow uploads ./out — keep base '/' and outDir 'out'.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'out',
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // three/@react-three were the WebGL ScrollWorld hero's vendor chunk — the v5
        // redesign replaced it with a flat photo-based Sequence hero, so listing them
        // here (an object literal forces Rollup to bundle them as entry points even
        // with zero importers left in the app) was shipping ~185KB of dead weight.
        manualChunks: {
          gsap: ['gsap', '@gsap/react'],
        },
      },
    },
  },
})
