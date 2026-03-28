import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { renameSync, mkdirSync, existsSync } from 'fs';

// After build, move dist/src/popup/index.html -> dist/popup/index.html
function fixHtmlOutput(): Plugin {
  return {
    name: 'fix-html-output',
    closeBundle() {
      const src = resolve(__dirname, 'dist/src/popup/index.html');
      const dest = resolve(__dirname, 'dist/popup/index.html');
      if (existsSync(src)) {
        mkdirSync(resolve(__dirname, 'dist/popup'), { recursive: true });
        renameSync(src, dest);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), fixHtmlOutput()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        chatgpt: resolve(__dirname, 'src/content/chatgpt.ts'),
        claude: resolve(__dirname, 'src/content/claude.ts'),
        gemini: resolve(__dirname, 'src/content/gemini.ts'),
        grok: resolve(__dirname, 'src/content/grok.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'popup') return 'popup/[name].js';
          if (chunkInfo.name === 'background') return 'background/service-worker.js';
          return 'content/[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'popup/[name][extname]';
          return '[name][extname]';
        },
      },
    },
  },
});
