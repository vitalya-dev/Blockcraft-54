import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/game-development-with-three.js-book-codes/',
    build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html'),
            // nested: resolve(__dirname, 'nested/index.html'),
            ch1hello: resolve(__dirname, 'chapter-1/hello/index.html'),
          }
        }
    }
})