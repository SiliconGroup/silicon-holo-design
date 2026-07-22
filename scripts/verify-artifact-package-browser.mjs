import { spawn, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const fixture = resolve(root, 'scripts/fixtures/artifact-package-browser')
const workspace = mkdtempSync(join(tmpdir(), 'silicon-holo-artifact-package-'))
const packageDirectory = join(workspace, 'package')
const consumerDirectory = join(workspace, 'consumer')
const candidates = [process.env.CHROME_BIN, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean)

function run(command, args, cwd, env = {}) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32', env: { ...process.env, ...env } })
  if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}\n${command} ${args.join(' ')} failed`)
  return result.stdout.trim()
}

function findBrowser() {
  for (const candidate of candidates) {
    if (candidate.startsWith('/') && existsSync(candidate)) return candidate
    if (!candidate.startsWith('/')) {
      const found = spawnSync('sh', ['-c', `command -v ${candidate}`], { encoding: 'utf8' })
      if (found.status === 0) return found.stdout.trim()
    }
  }
  throw new Error('Chrome or Chromium is required for the packaged Artifact browser contract.')
}

function freePort() {
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
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(url)).ok) return } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 100))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

async function connectToChrome(debugPort) {
  const endpoint = `http://127.0.0.1:${debugPort}/json/list`
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const targets = await fetch(endpoint).then(response => response.json())
      const page = targets.find(target => target.type === 'page')
      if (page?.webSocketDebuggerUrl) {
        const socket = new WebSocket(page.webSocketDebuggerUrl)
        await new Promise((resolveOpen, reject) => {
          socket.addEventListener('open', resolveOpen, { once: true })
          socket.addEventListener('error', reject, { once: true })
        })
        return socket
      }
    } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 100))
  }
  throw new Error('Timed out connecting to headless Chrome.')
}

function createChromeSession(socket) {
  let nextId = 0
  const pending = new Map()

  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (!message.id) return
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error.message))
    else request.resolve(message.result)
  })

  return (method, params = {}) => new Promise((resolveRequest, reject) => {
    const id = ++nextId
    pending.set(id, { resolve: resolveRequest, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}

async function waitForContract(send) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const result = await send('Runtime.evaluate', {
      expression: `({
        contract: document.body.dataset.artifactPackageContract,
        error: document.body.dataset.artifactPackageError,
        originalBytes: document.body.dataset.originalBytes,
        currentBytes: document.body.dataset.currentBytes,
        pdfLoaded: document.querySelector('[data-shd-pdf-loaded]')?.getAttribute('data-shd-pdf-loaded'),
        pdfRendered: document.querySelector('[data-shd-pdf-rendered]')?.getAttribute('data-shd-pdf-rendered')
      })`,
      returnByValue: true,
    })
    const state = result.result.value
    if (state.error) throw new Error(state.error)
    if (state.contract === 'pass') return state
    await new Promise(resolveWait => setTimeout(resolveWait, 250))
  }
  throw new Error('Timed out waiting for the packaged Artifact browser contract.')
}

async function terminateProcess(processHandle) {
  if (processHandle.exitCode !== null || processHandle.signalCode !== null) return
  const exited = new Promise(resolveExit => processHandle.once('exit', resolveExit))
  processHandle.kill('SIGTERM')
  await Promise.race([exited, new Promise(resolveWait => setTimeout(resolveWait, 2000))])
  if (processHandle.exitCode === null && processHandle.signalCode === null) processHandle.kill('SIGKILL')
}

async function verifyBrowser(command, args, label) {
  const port = await freePort()
  const debugPort = await freePort()
  const url = `http://127.0.0.1:${port}`
  const processHandle = spawn(command, [...args, '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: consumerDirectory, stdio: ['ignore', 'pipe', 'pipe'] })
  const chromeHandle = spawn(findBrowser(), [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${join(workspace, `chrome-${label.toLowerCase().replaceAll(' ', '-')}`)}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] })
  let serverOutput = ''
  let chromeOutput = ''
  processHandle.stdout.on('data', chunk => { serverOutput += chunk })
  processHandle.stderr.on('data', chunk => { serverOutput += chunk })
  chromeHandle.stdout.on('data', chunk => { chromeOutput += chunk })
  chromeHandle.stderr.on('data', chunk => { chromeOutput += chunk })
  let socket
  try {
    await waitForServer(url)
    socket = await connectToChrome(debugPort)
    const send = createChromeSession(socket)
    await send('Runtime.enable')
    await send('Page.enable')
    await send('Page.navigate', { url })
    const state = await waitForContract(send)
    if (!state.originalBytes || state.currentBytes === '0' || state.currentBytes !== state.originalBytes) throw new Error(`${label} detached the caller ArrayBuffer.`)
  } catch (error) {
    process.stdout.write(serverOutput)
    process.stderr.write(chromeOutput)
    throw new Error(`${label} packaged Artifact browser contract failed: ${error.message}`)
  } finally {
    socket?.close()
    await Promise.all([terminateProcess(chromeHandle), terminateProcess(processHandle)])
  }
}

try {
  mkdirSync(packageDirectory)
  cpSync(fixture, consumerDirectory, { recursive: true })
  mkdirSync(join(consumerDirectory, 'public'))
  cpSync(resolve(root, 'assets/artifact-preview/complex-document.pdf'), join(consumerDirectory, 'public/sample.pdf'))
  const packedName = run('npm', ['pack', '--silent', '--pack-destination', packageDirectory], root, { SHD_SKIP_PREPARE: '1' }).split('\n').at(-1)
  if (!packedName) throw new Error('npm pack did not return a tarball name')
  writeFileSync(join(consumerDirectory, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    scripts: { build: 'vite build' },
    dependencies: {
      '@vitejs/plugin-react': '^4.3.4',
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'silicon-holo-design': `file:${join(packageDirectory, packedName)}`,
      typescript: '^5.7.2',
      vite: '^6.4.3',
    },
  }, null, 2))
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock'], consumerDirectory)

  const vite = join(consumerDirectory, 'node_modules/vite/bin/vite.js')
  await verifyBrowser(process.execPath, [vite], 'Vite dev')
  run(process.execPath, [vite, 'build'], consumerDirectory)

  const emittedFiles = readdirSync(join(consumerDirectory, 'dist/assets'))
  if (emittedFiles.some(file => /^pdf\.worker\./.test(file))) throw new Error('Packaged consumer emitted a separately addressed PDF worker asset.')
  const javascript = emittedFiles.filter(file => file.endsWith('.js')).map(file => readFileSync(join(consumerDirectory, 'dist/assets', file), 'utf8')).join('\n')
  if (/new Worker\(["']\/assets\/pdf\.worker/.test(javascript)) throw new Error('Packaged consumer retained an absolute PDF worker URL.')

  await verifyBrowser(process.execPath, [vite, 'preview'], 'Vite preview')
  console.log('✓ Packaged PDF Artifact works in Vite dev and production without detaching ArrayBuffer sources')
} finally {
  if (process.env.SHD_KEEP_ARTIFACT_PACKAGE_FIXTURE === '1') console.log(`Artifact package fixture retained at ${workspace}`)
  else rmSync(workspace, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
