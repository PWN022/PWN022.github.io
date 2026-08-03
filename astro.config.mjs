import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { codeBlockPlugin } from './src/plugins/code-block.mjs';

export default defineConfig({
  site: 'https://attackor7.tech',
  output: 'static',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  vite: {
    build: {
      rollupOptions: {
        external: /^\/pagefind\//,
      },
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    rehypePlugins: [codeBlockPlugin],
  },
});
