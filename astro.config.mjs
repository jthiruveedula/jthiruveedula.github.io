import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://jthiruveedula.github.io',
  base: '/',
  output: 'static',
  build: {
    format: 'directory',
    assets: 'assets'
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    sitemap(),
  ],
  vite: {
    css: {
      transformer: 'postcss',
    },
    optimizeDeps: {
      exclude: ['@fontsource/inter']
    }
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  experimental: {
    assets: true
  }
});
