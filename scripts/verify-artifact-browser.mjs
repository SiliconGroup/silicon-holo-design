import { spawn, spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const fixture = resolve(root, 'scripts/fixtures/artifact-browser')
const output = resolve(fixture, 'dist')
const vite = resolve(root, 'node_modules/vite/bin/vite.js')
const candidates = [process.env.CHROME_BIN, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean)

function findBrowser() {
  for (const candidate of candidates) {
    if (candidate.startsWith('/') && existsSync(candidate)) return candidate
    if (!candidate.startsWith('/')) {
      const found = spawnSync('sh', ['-c', `command -v ${candidate}`], { encoding: 'utf8' })
      if (found.status === 0) return found.stdout.trim()
    }
  }
  throw new Error('Chrome or Chromium is required for the Artifact browser contract.')
}

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
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(url)).ok) break } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 100))
  }
  const result = spawnSync(findBrowser(), ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--virtual-time-budget=35000', '--dump-dom', url], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
  if (result.status !== 0 || !result.stdout.includes('data-artifact-contract="pass"')) {
    process.stdout.write(result.stdout)
    process.stderr.write(result.stderr)
    throw new Error('Artifact browser contract failed.')
  }
  console.log('✓ Markdown, PDF, and spreadsheet Artifact renderers pass in real Chrome')
} finally {
  preview.kill('SIGTERM')
  rmSync(output, { recursive: true, force: true })
}
