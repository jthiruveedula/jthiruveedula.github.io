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
      // Two static pages served from one build: the main portfolio, and the
      // scroll-driven career journey at /journey/. Each gets its own JS/CSS
      // entry, so `three` (imported only from src/journey/City.ts) never
      // reaches the main page's bundle graph.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        journey: fileURLToPath(new URL('./journey/index.html', import.meta.url)),
      },
      output: {
        // three/@react-three were the WebGL ScrollWorld hero's vendor chunk — the v5
        // redesign replaced it with a flat photo-based Sequence hero, so listing them
        // here (an object literal forces Rollup to bundle them as entry points even
        // with zero importers left in the app) was shipping ~185KB of dead weight.
        // `three` is back for the /journey/ page only — dynamically imported from
        // City.ts, so it still never touches the main entry's chunk graph.
        manualChunks: {
          gsap: ['gsap', '@gsap/react'],
          three: ['three'],
        },
      },
    },
  },
})
