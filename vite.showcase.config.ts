import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react(), UnoCSS()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  root: resolve(__dirname, 'showcases'),
  publicDir: resolve(__dirname, 'assets'),
  server: { port: 6007 },
})
