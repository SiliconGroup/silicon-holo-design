import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../..')

export default defineConfig({
  root: import.meta.dirname,
  publicDir: resolve(root, 'assets'),
  plugins: [react(), UnoCSS()],
  resolve: { alias: { '@': resolve(root, 'src') } },
  build: { outDir: resolve(import.meta.dirname, 'dist'), emptyOutDir: true },
})
