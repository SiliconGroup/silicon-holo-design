import { spawnSync } from 'node:child_process'

if (process.env.SHD_SKIP_PREPARE !== '1') {
  const result = spawnSync('npm', ['run', 'build:dist'], { stdio: 'inherit', shell: process.platform === 'win32' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
