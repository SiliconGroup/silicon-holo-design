import type { HoloFileKind } from '../types'

/** 语言 id 由扩展名推断。key 不含点号，全小写。 */
const languageByExtension: Record<string, string> = {
  ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  json: 'json', jsonc: 'json', json5: 'json',
  md: 'markdown', markdown: 'markdown', mdx: 'markdown',
  py: 'python', pyi: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java', kt: 'kotlin', kts: 'kotlin', scala: 'scala', groovy: 'groovy',
  c: 'c', h: 'c',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp', hxx: 'cpp',
  cs: 'csharp',
  rb: 'ruby', php: 'php', swift: 'swift', dart: 'dart', lua: 'lua', r: 'r',
  sh: 'bash', bash: 'bash', zsh: 'bash', fish: 'bash',
  ps1: 'powershell',
  sql: 'sql', graphql: 'graphql', gql: 'graphql', proto: 'protobuf',
  html: 'html', htm: 'html', xml: 'xml', svg: 'xml', vue: 'html', svelte: 'html',
  css: 'css', scss: 'scss', sass: 'scss', less: 'less',
  yml: 'yaml', yaml: 'yaml', toml: 'ini', ini: 'ini', cfg: 'ini', conf: 'ini', env: 'ini',
  dockerfile: 'dockerfile', makefile: 'makefile', diff: 'diff', patch: 'diff',
  tex: 'latex', vim: 'vim', zig: 'zig', nim: 'nim', ex: 'elixir', exs: 'elixir',
  erl: 'erlang', hs: 'haskell', clj: 'clojure', pl: 'perl', ml: 'ocaml',
}

/** 无扩展名但语言可确定的文件名（全小写）。 */
const languageByFileName: Record<string, string> = {
  dockerfile: 'dockerfile',
  makefile: 'makefile',
  cmakelists: 'cmake',
  gemfile: 'ruby',
  rakefile: 'ruby',
  '.gitignore': 'ini',
  '.gitattributes': 'ini',
  '.editorconfig': 'ini',
  '.npmrc': 'ini',
  '.env': 'ini',
  '.dockerignore': 'ini',
  license: 'plaintext',
  '.ds_store': 'plaintext',
}

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'ico', 'apng'])
const binaryExtensions = new Set([
  'zip', 'gz', 'tar', 'tgz', 'bz2', 'xz', '7z', 'rar', 'jar', 'war',
  'exe', 'dll', 'so', 'dylib', 'bin', 'o', 'a', 'lib', 'obj', 'class', 'wasm', 'pyc',
  'mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a',
  'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv',
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  'db', 'sqlite', 'sqlite3', 'dat', 'pack', 'idx', 'lock',
  'doc', 'docx', 'ppt', 'pptx', 'psd', 'sketch', 'fig',
  'heic', 'tif', 'tiff', 'raw',
])
const spreadsheetExtensions = new Set(['xlsx', 'xls', 'xlsm', 'csv', 'tsv'])

function splitFileName(fileName: string) {
  const base = fileName.replace(/\\/g, '/').split('/').pop() ?? fileName
  const lower = base.toLowerCase()
  const dot = lower.lastIndexOf('.')
  const extension = dot > 0 ? lower.slice(dot + 1) : ''
  const stem = dot > 0 ? lower.slice(0, dot) : lower
  return { base, lower, extension, stem }
}

/** 由文件名与可选 mime 推断呈现种类。纯函数。 */
export function inferFileKind(input: { fileName: string; mimeType?: string }): HoloFileKind {
  const mime = input.mimeType?.toLowerCase() ?? ''
  const { lower, extension, stem } = splitFileName(input.fileName)

  if (mime) {
    if (mime === 'image/svg+xml') return 'svg'
    if (mime.startsWith('image/')) return 'image'
    if (mime === 'application/pdf') return 'pdf'
    if (mime.includes('spreadsheet') || mime.includes('excel') || mime === 'text/csv') return 'spreadsheet'
    if (mime === 'text/markdown') return 'markdown'
    if (mime === 'text/html') return 'html'
    if (mime.startsWith('audio/') || mime.startsWith('video/') || mime === 'application/octet-stream') return 'binary'
  }

  if (extension === 'svg') return 'svg'
  if (imageExtensions.has(extension)) return 'image'
  if (extension === 'pdf') return 'pdf'
  if (spreadsheetExtensions.has(extension)) return 'spreadsheet'
  if (extension === 'md' || extension === 'markdown' || extension === 'mdx') return 'markdown'
  if (extension === 'html' || extension === 'htm') return 'html'
  if (binaryExtensions.has(extension)) return 'binary'
  if (extension === '' && !(lower in languageByFileName) && !(stem in languageByFileName)) return 'code'
  return 'code'
}

/** 由文件名推断代码语言 id。未知返回 undefined。 */
export function inferLanguageId(fileName: string): string | undefined {
  const { lower, extension, stem } = splitFileName(fileName)
  if (extension && extension in languageByExtension) return languageByExtension[extension]
  if (lower in languageByFileName) return languageByFileName[lower]
  if (stem in languageByFileName) return languageByFileName[stem]
  return undefined
}
