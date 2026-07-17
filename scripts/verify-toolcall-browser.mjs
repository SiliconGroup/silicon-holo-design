import { spawn, spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const fixture = resolve(root, 'scripts/fixtures/toolcall-browser')
const output = resolve(fixture, 'dist')
const vite = resolve(root, 'node_modules/vite/bin/vite.js')
const browser = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

if (!existsSync(browser)) throw new Error('Set CHROME_BIN to Chrome or Chromium for the ToolCall browser contract.')

const port = await new Promise((resolvePort, reject) => {
  const server = createServer()
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    server.close(() => resolvePort(address.port))
  })
})

rmSync(output, { recursive: true, force: true })
const build = spawnSync(process.execPath, [vite, 'build', '--config', resolve(fixture, 'vite.config.mjs')], { cwd: fixture, encoding: 'utf8' })
if (build.status !== 0) throw new Error(`${build.stdout}\n${build.stderr}`)

const url = `http://127.0.0.1:${port}`
const preview = spawn(process.execPath, [vite, 'preview', '--config', resolve(fixture, 'vite.config.mjs'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: fixture, stdio: 'ignore' })
try {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { if ((await fetch(url)).ok) break } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 100))
  }
  const result = spawnSync(browser, ['--headless=new', '--disable-gpu', '--no-sandbox', '--virtual-time-budget=3000', '--dump-dom', url], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  if (result.status !== 0 || !result.stdout.includes('data-tool-contract="pass"')) {
    process.stdout.write(result.stdout)
    process.stderr.write(result.stderr)
    throw new Error('ToolCall browser contract failed.')
  }
  console.log('✓ Tool, Markdown, directional border, and overlay visual contracts pass in real Chrome')
} finally {
  preview.kill('SIGTERM')
  rmSync(output, { recursive: true, force: true })
}
