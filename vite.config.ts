import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    react(),
    UnoCSS(),
    dts({ exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx', 'src/components/ai/copy-action/**', 'showcases', 'examples', 'refs'] }),
  ],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'preset/index': resolve(__dirname, 'src/preset/index.ts'),
        'components/chat/index': resolve(__dirname, 'src/components/chat/index.ts'),
        'components/ai/index': resolve(__dirname, 'src/components/ai/index.ts'),
        'locale/en-US': resolve(__dirname, 'src/locale/en-US.ts'),
        'locale/zh-CN': resolve(__dirname, 'src/locale/zh-CN.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'highlight.js',
        'react-markdown',
        'remark-gfm',
        'remark-math',
        'rehype-katex',
        'mermaid',
      ],
      output: { entryFileNames: '[name].js', globals: { react: 'React', 'react-dom': 'ReactDOM' } },
    },
  },
})
