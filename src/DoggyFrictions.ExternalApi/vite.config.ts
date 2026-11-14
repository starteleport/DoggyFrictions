/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// The front end (ClientApp/) is built into wwwroot/dist, which the Razor layout includes as
// dist/app.js and dist/app.css; ASP.NET adds a content hash (asp-append-version) to their URLs.
export default defineConfig({
  plugins: [vue({
    template: {
      // Whitespace between tags is kept as in plain HTML: inline buttons, captions and fields are spaced by it.
      compilerOptions: { whitespace: 'preserve' },
      // "/img/…" in templates are files the server serves from wwwroot, not modules to bundle.
      transformAssetUrls: { includeAbsolute: false },
    },
  })],
  base: '/dist/',
  publicDir: false,
  build: {
    outDir: 'wwwroot/dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: 'ClientApp/main.ts',
      output: {
        entryFileNames: 'app.js',
        // Fonts and images keep a hash in their names: the stylesheet refers to them directly.
        assetFileNames: asset => asset.names.some(name => name.endsWith('.css')) ? 'app.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
  test: {
    include: ['ClientApp/**/*.test.ts'],
  },
});
