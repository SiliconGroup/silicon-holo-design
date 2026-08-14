import { describe, expect, it } from 'vitest'
import { inferFileKind, inferLanguageId } from './file-kind'

describe('inferFileKind', () => {
  it('maps common code extensions to code', () => {
    for (const name of ['index.ts', 'App.tsx', 'main.rs', 'server.go', 'style.css', 'data.json']) {
      expect(inferFileKind({ fileName: name }), name).toBe('code')
    }
  })

  it('recognises previewable document kinds', () => {
    expect(inferFileKind({ fileName: 'README.md' })).toBe('markdown')
    expect(inferFileKind({ fileName: 'notes.markdown' })).toBe('markdown')
    expect(inferFileKind({ fileName: 'report.pdf' })).toBe('pdf')
    expect(inferFileKind({ fileName: 'book.xlsx' })).toBe('spreadsheet')
    expect(inferFileKind({ fileName: 'rows.csv' })).toBe('spreadsheet')
    expect(inferFileKind({ fileName: 'page.html' })).toBe('html')
  })

  it('separates svg from raster images', () => {
    expect(inferFileKind({ fileName: 'logo.svg' })).toBe('svg')
    expect(inferFileKind({ fileName: 'photo.PNG' })).toBe('image')
    expect(inferFileKind({ fileName: 'anim.webp' })).toBe('image')
  })

  it('detects binary payloads', () => {
    for (const name of ['bundle.wasm', 'archive.tar.gz', 'font.woff2', 'lib.dylib', 'clip.mp4', 'db.sqlite3']) {
      expect(inferFileKind({ fileName: name }), name).toBe('binary')
    }
  })

  it('prefers mime type over the extension', () => {
    expect(inferFileKind({ fileName: 'blob.txt', mimeType: 'application/pdf' })).toBe('pdf')
    expect(inferFileKind({ fileName: 'blob.txt', mimeType: 'image/svg+xml' })).toBe('svg')
    expect(inferFileKind({ fileName: 'blob.txt', mimeType: 'image/png' })).toBe('image')
    expect(inferFileKind({ fileName: 'sheet.md', mimeType: 'text/csv' })).toBe('spreadsheet')
    expect(inferFileKind({ fileName: 'thing.md', mimeType: 'application/octet-stream' })).toBe('binary')
  })

  it('is case insensitive and path tolerant', () => {
    expect(inferFileKind({ fileName: 'src/deep/README.MD' })).toBe('markdown')
    expect(inferFileKind({ fileName: 'C:\\repo\\Logo.SVG' })).toBe('svg')
  })

  it('falls back to code for extensionless and unknown files', () => {
    expect(inferFileKind({ fileName: 'Dockerfile' })).toBe('code')
    expect(inferFileKind({ fileName: 'LICENSE' })).toBe('code')
    expect(inferFileKind({ fileName: 'thing.unheardof' })).toBe('code')
    expect(inferFileKind({ fileName: '.gitignore' })).toBe('code')
  })
})

describe('inferLanguageId', () => {
  it('maps extensions to language ids', () => {
    expect(inferLanguageId('index.tsx')).toBe('typescript')
    expect(inferLanguageId('script.mjs')).toBe('javascript')
    expect(inferLanguageId('main.rs')).toBe('rust')
    expect(inferLanguageId('app.py')).toBe('python')
    expect(inferLanguageId('config.yml')).toBe('yaml')
    expect(inferLanguageId('Cargo.toml')).toBe('ini')
    expect(inferLanguageId('run.sh')).toBe('bash')
  })

  it('handles extensionless well-known file names', () => {
    expect(inferLanguageId('Dockerfile')).toBe('dockerfile')
    expect(inferLanguageId('Makefile')).toBe('makefile')
    expect(inferLanguageId('.gitignore')).toBe('ini')
  })

  it('returns undefined for unknown files', () => {
    expect(inferLanguageId('mystery.qqq')).toBeUndefined()
    expect(inferLanguageId('noextension')).toBeUndefined()
  })
})
