import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ArtifactRenderer } from '@/components/ai/artifact-preview/ArtifactRenderer'
import '@/styles/base.css'
import '@/styles/animations.css'
import '@/styles/generated-utilities.css'
import 'katex/dist/katex.min.css'

const artifacts = {
  markdown: { id: 'markdown', type: 'markdown', title: 'Markdown', content: '', source: { kind: 'url' as const, url: '/artifact-preview/complex-markdown.md' } },
  pdf: { id: 'pdf', type: 'pdf', title: 'PDF', content: '/artifact-preview/complex-document.pdf' },
  spreadsheet: { id: 'xlsx', type: 'xlsx', title: 'Spreadsheet', content: '', source: { kind: 'url' as const, url: '/artifact-preview/complex-workbook.xlsx' } },
}

async function waitFor(check: () => boolean, label: string) {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    if (check()) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Timed out waiting for ${label}`)
}

function App() {
  useEffect(() => {
    void (async () => {
      await waitFor(() => Boolean(document.querySelector('[data-shd-artifact-renderer="markdown"] h1')), 'Markdown heading')
      await waitFor(() => Boolean(document.querySelector('[data-shd-artifact-renderer="markdown"] .katex')), 'KaTeX')
      await waitFor(() => document.querySelector('[data-shd-artifact-renderer="markdown"] [data-shd-mermaid]')?.getAttribute('data-shd-mermaid') === 'ready', 'Mermaid')
      await waitFor(() => Boolean(document.querySelector('[data-shd-artifact-renderer="spreadsheet"] table')), 'spreadsheet table')
      const merged = Array.from(document.querySelectorAll<HTMLTableCellElement>('[data-shd-artifact-renderer="spreadsheet"] td')).find(cell => cell.colSpan > 1)
      if (!merged) throw new Error('Spreadsheet merged cells were not preserved.')
      await waitFor(() => document.querySelector('[data-shd-artifact-renderer="pdf"]')?.getAttribute('data-shd-pdf-loaded') === 'true' && Boolean(document.querySelector('[data-shd-artifact-renderer="pdf"] canvas')), 'loaded PDF page canvas')
      document.body.dataset.artifactContract = 'pass'
    })().catch(error => {
      document.body.dataset.artifactContract = 'fail'
      document.body.dataset.artifactError = error instanceof Error ? error.message : String(error)
    })
  }, [])

  return <main className="grid min-h-screen gap-4 bg-surface-canvas p-4 text-content-primary" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
    <section className="h-[760px] min-w-0 overflow-hidden rounded-md border border-stroke-subtle bg-surface-base"><ArtifactRenderer artifact={artifacts.markdown} onEscape={() => {}} /></section>
    <section className="h-[760px] min-w-0 overflow-hidden rounded-md border border-stroke-subtle bg-surface-base"><ArtifactRenderer artifact={artifacts.pdf} onEscape={() => {}} /></section>
    <section className="h-[760px] min-w-0 overflow-hidden rounded-md border border-stroke-subtle bg-surface-base"><ArtifactRenderer artifact={artifacts.spreadsheet} onEscape={() => {}} /></section>
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
