import { spawn, spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const fixture = resolve(root, 'scripts/fixtures/theme-browser')
const output = resolve(fixture, 'dist')
const vite = resolve(root, 'node_modules/vite/bin/vite.js')
const browserCandidates = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'google-chrome',
  'chromium',
  'chromium-browser',
].filter(Boolean)

function findBrowser() {
  for (const candidate of browserCandidates) {
    if (candidate.startsWith('/') && existsSync(candidate)) return candidate
    if (!candidate.startsWith('/')) {
      const check = spawnSync('sh', ['-c', `command -v ${candidate}`], { encoding: 'utf8' })
      if (check.status === 0) return check.stdout.trim()
    }
  }
  throw new Error('Chrome or Chromium is required for the ThemeProvider browser contract.')
}

async function getPort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close(() => resolvePort(address.port))
    })
  })
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 100))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

rmSync(output, { recursive: true, force: true })
const build = spawnSync(process.execPath, [vite, 'build', '--config', resolve(fixture, 'vite.config.mjs')], { cwd: fixture, encoding: 'utf8' })
if (build.status !== 0) {
  process.stdout.write(build.stdout)
  process.stderr.write(build.stderr)
  process.exit(build.status ?? 1)
}

const port = await getPort()
const url = `http://127.0.0.1:${port}`
const preview = spawn(process.execPath, [vite, 'preview', '--config', resolve(fixture, 'vite.config.mjs'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: fixture,
  stdio: 'ignore',
})

try {
  await waitForServer(url)
  const result = spawnSync(findBrowser(), [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--virtual-time-budget=10000',
    '--dump-dom',
    url,
  ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })

  if (result.status !== 0 || !result.stdout.includes('data-theme-contract="pass"')) {
    process.stdout.write(result.stdout)
    process.stderr.write(result.stderr)
    throw new Error('ThemeProvider browser computed-style contract failed.')
  }
  console.log('✓ ThemeProvider computed styles derive, override, and restore in real Chrome')
} finally {
  preview.kill('SIGTERM')
  rmSync(output, { recursive: true, force: true })
}
