/**
 * CodeMirror 6 隔离门禁。
 *
 * 背景：`@codemirror/*` 是 optional peerDependencies 且进入 rollupOptions.external，
 * 裸模块名会原样留在 dist 中。若它们泄漏到 `./studio` 或其他公共入口的可达闭包里，
 * 未安装 CodeMirror 的消费者会在**构建期**硬失败（Failed to resolve import），
 * 且症状离原因很远、排查成本极高。因此必须由门禁而非人工纪律保障。
 *
 * 检查两层：
 *   1. 源码层：src/components/studio/editor/ 之外不得出现 @codemirror/ 或 @lezer/ 引用。
 *   2. 产物层：从各公共入口做 import 图可达性分析，断言含 @codemirror 的文件
 *      只属于 editor 入口的可达闭包，且不属于任何其他公共入口的闭包。
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { globSync } from 'glob'

const root = resolve(import.meta.dirname, '..')
const distDir = join(root, 'dist')
const OPTIONAL_PATTERN = /@codemirror\/|@lezer\//
const EDITOR_ENTRY = 'dist/components/studio/editor/index.js'
const PUBLIC_ENTRIES = [
  'dist/index.js',
  'dist/components/chat/index.js',
  'dist/components/ai/index.js',
  'dist/components/studio/index.js',
  'dist/preset/index.js',
  ...globSync('dist/locale/*.js', { cwd: root }),
]

const failures = []

/* ---------------------------------------------------------------- source */

const sourceFiles = globSync('src/**/*.{ts,tsx}', { cwd: root, absolute: true, ignore: ['**/*.test.{ts,tsx}'] })
const editorSourceDir = join(root, 'src/components/studio/editor')
const sourceOffenders = sourceFiles
  .filter(file => !file.startsWith(`${editorSourceDir}/`))
  .filter(file => OPTIONAL_PATTERN.test(readFileSync(file, 'utf8')))
  .map(file => relative(root, file))

if (sourceOffenders.length > 0) {
  failures.push(`optional CodeMirror packages referenced outside src/components/studio/editor/:\n  ${sourceOffenders.join('\n  ')}`)
}

const studioEntrySource = readFileSync(join(root, 'src/components/studio/index.ts'), 'utf8')
if (/from ['"]\.\/editor/.test(studioEntrySource) || /from ['"]\.\/editor['"]/.test(studioEntrySource)) {
  failures.push('src/components/studio/index.ts must not re-export the editor entry')
}

/* ------------------------------------------------------------------ dist */

const IMPORT_SPECIFIER = /(?:^|[\s;}])(?:import|export)\s*(?:[\s\S]*?\sfrom\s*)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g

function readDistFile(relativePath) {
  const absolute = join(root, relativePath)
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : null
}

function specifiersOf(relativePath, source) {
  const result = []
  for (const match of source.matchAll(IMPORT_SPECIFIER)) {
    const specifier = match[1] ?? match[2]
    if (!specifier) continue
    if (!specifier.startsWith('.')) continue
    const target = relative(root, resolve(join(root, dirname(relativePath)), specifier))
    result.push(target)
  }
  return result
}

/** 返回 Map<file, parent>，用于打印最短引用链。 */
function reachableFrom(entries) {
  const parents = new Map()
  const queue = []
  for (const entry of entries) {
    if (readDistFile(entry) === null) continue
    parents.set(entry, null)
    queue.push(entry)
  }
  while (queue.length > 0) {
    const current = queue.shift()
    const source = readDistFile(current)
    if (source === null) continue
    for (const next of specifiersOf(current, source)) {
      if (parents.has(next)) continue
      if (readDistFile(next) === null) continue
      parents.set(next, current)
      queue.push(next)
    }
  }
  return parents
}

function chainTo(parents, file) {
  const chain = []
  let cursor = file
  while (cursor !== undefined && cursor !== null) {
    chain.unshift(cursor)
    cursor = parents.get(cursor)
  }
  return chain.join(' → ')
}

if (!existsSync(distDir)) {
  console.error('dist/ is missing. Run the build before verifying optional dependency isolation.')
  process.exit(1)
}

if (readDistFile(EDITOR_ENTRY) === null) {
  failures.push(`expected editor entry is missing from dist: ${EDITOR_ENTRY}`)
}

const editorReachable = reachableFrom([EDITOR_ENTRY])
const publicReachable = reachableFrom(PUBLIC_ENTRIES)

const distFiles = globSync('dist/**/*.{js,d.ts}', { cwd: root }).sort()
const optionalFiles = distFiles.filter(file => OPTIONAL_PATTERN.test(readFileSync(join(root, file), 'utf8')))

for (const file of optionalFiles) {
  if (publicReachable.has(file)) {
    failures.push(`optional CodeMirror import leaked into a public entry closure:\n  ${file}\n  chain: ${chainTo(publicReachable, file)}`)
    continue
  }
  const isDeclaration = file.endsWith('.d.ts')
  if (!isDeclaration && !editorReachable.has(file)) {
    failures.push(`optional CodeMirror import found in a file unreachable from the editor entry:\n  ${file}`)
  }
}

/* --------------------------------------------------------------- reports */

if (failures.length > 0) {
  console.error(`✗ optional dependency isolation broken:\n\n${failures.join('\n\n')}\n`)
  process.exit(1)
}

console.log(`✓ optional CodeMirror packages stay inside ${EDITOR_ENTRY} (${optionalFiles.length} carrier files, ${publicReachable.size} public files scanned)`)
