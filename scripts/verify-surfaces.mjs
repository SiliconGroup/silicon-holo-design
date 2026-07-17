import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const vite = resolve('node_modules/vite/bin/vite.js')
const configs = [
  'vite.showcase.config.ts',
  'examples/vite-basic/vite.config.ts',
  'examples/chat/vite.config.ts',
  'examples/ai-chat/vite.config.ts',
  'examples/component-gallery/vite.config.ts',
]

for (const config of configs) {
  try {
    execFileSync(process.execPath, [vite, 'build', '--config', config], { stdio: 'pipe' })
    console.log(`✓ production surface build: ${config}`)
  } catch (error) {
    if (error.stdout) process.stdout.write(error.stdout)
    if (error.stderr) process.stderr.write(error.stderr)
    throw error
  }
}
