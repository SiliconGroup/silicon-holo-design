import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react(), UnoCSS({ configFile: resolve(__dirname, '../../uno.config.ts') })],
  resolve: { alias: { '@': resolve(__dirname, '../../src') } },
  root: __dirname,
  publicDir: resolve(__dirname, '../../assets'),
})
