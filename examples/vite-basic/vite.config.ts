import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: [
    { find: 'silicon-holo-design/styles', replacement: resolve(__dirname, '../../dist/silicon-holo-design.css') },
    { find: 'silicon-holo-design', replacement: resolve(__dirname, '../../src/index.ts') },
    { find: '@', replacement: resolve(__dirname, '../../src') },
  ] },
  root: __dirname,
  publicDir: resolve(__dirname, '../../assets'),
})
