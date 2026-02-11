import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    react(),
    UnoCSS(),
    dts({ exclude: ['**/*.test.tsx', '**/*.stories.tsx', 'showcases', 'examples'] }),
  ],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    lib: { entry: { index: resolve(__dirname, 'src/index.ts'), 'preset/index': resolve(__dirname, 'src/preset/index.ts') }, formats: ['es'] },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: { entryFileNames: '[name].js', globals: { react: 'React', 'react-dom': 'ReactDOM' } },
    },
  },
})
