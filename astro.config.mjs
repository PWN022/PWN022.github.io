import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { codeBlockPlugin } from './src/plugins/code-block.mjs';

export default defineConfig({
  site: 'https://bound2.space',
  output: 'static',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    rehypePlugins: [codeBlockPlugin],
  },
});
