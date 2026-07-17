import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { globSync } from 'glob'

const root = resolve(import.meta.dirname, '..')
const files = globSync('dist/**/*.d.ts', { cwd: root }).sort()
const hash = createHash('sha256')

for (const file of files) {
  hash.update(file)
  hash.update('\0')
  hash.update(readFileSync(resolve(root, file)))
  hash.update('\0')
}

const actual = hash.digest('hex')
if (process.argv.includes('--print')) {
  console.log(actual)
  process.exit(0)
}

const expected = readFileSync(resolve(root, 'scripts/public-types.sha256'), 'utf8').trim()
if (actual !== expected) {
  console.error(`Public declaration baseline changed. Expected ${expected}, received ${actual}. Review API compatibility before updating scripts/public-types.sha256.`)
  process.exit(1)
}

console.log(`✓ public declaration baseline verified across ${files.length} files`)
