import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { IconButton } from '@/components/general/icon-button'
import type { Artifact } from '@/types'
import { resolveArtifactSource } from '../artifact-resource'
import { useArtifactArrayBuffer } from '../use-artifact-resource'
import { RendererError, RendererLoading } from './RendererState'

pdfjs.GlobalWorkerOptions.workerPort ??= new PdfWorker()

function PreviousIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg>
}

function NextIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg>
}

function MinusIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M6 12h12" /></svg>
}

function PlusIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M12 6v12M6 12h12" /></svg>
}

export function PdfRenderer({ artifact }: { artifact: Artifact }) {
  const source = resolveArtifactSource(artifact)
  const bytes = useArtifactArrayBuffer(artifact, source.kind !== 'url')
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef(new Map<number, HTMLDivElement>())
  const scrollFrame = useRef<number | null>(null)
  const [pages, setPages] = useState(0)
  const [page, setPage] = useState(1)
  const [width, setWidth] = useState(720)
  const [scale, setScale] = useState(1)
  const [renderLimit, setRenderLimit] = useState(1)
  const [renderedPages, setRenderedPages] = useState(() => new Set<number>())

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const update = () => setWidth(Math.max(280, Math.min(960, element.clientWidth - 32)))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current)
  }, [])

  const file = source.kind === 'url' ? source.url : bytes.data ? { data: new Uint8Array(bytes.data) } : null
  if (source.kind !== 'url' && bytes.loading) return <RendererLoading label="Loading PDF" />
  if (source.kind !== 'url' && (bytes.error || !file)) return <RendererError message={bytes.error ?? 'PDF is unavailable'} />

  const scrollToPage = (nextPage: number) => {
    const target = Math.max(1, Math.min(pages, nextPage))
    setPage(target)
    pageRefs.current.get(target)?.scrollIntoView({ block: 'start' })
  }

  const syncPageFromScroll = () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current)
    scrollFrame.current = requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return
      let closestPage = page
      let closestDistance = Number.POSITIVE_INFINITY
      for (const [pageNumber, element] of pageRefs.current) {
        const distance = Math.abs(element.offsetTop - container.scrollTop - 16)
        if (distance < closestDistance) {
          closestDistance = distance
          closestPage = pageNumber
        }
      }
      setPage(closestPage)
    })
  }

  return <div data-shd-artifact-renderer="pdf" data-shd-pdf-loaded={pages > 0 ? 'true' : 'false'} data-shd-pdf-rendered={renderedPages.has(page) ? 'true' : 'false'} className="flex h-full min-h-0 flex-col bg-surface-canvas">
    <div className="shd-overlay-header flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs text-content-secondary">
      <div className="flex items-center gap-2">
        <IconButton size="sm" variant="ghost" title="Previous page" disabled={page <= 1} onClick={() => scrollToPage(page - 1)}><PreviousIcon /></IconButton>
        <span>{page} / {pages || '—'}</span>
        <IconButton size="sm" variant="ghost" title="Next page" disabled={!pages || page >= pages} onClick={() => scrollToPage(page + 1)}><NextIcon /></IconButton>
      </div>
      <div className="flex items-center gap-2">
        <IconButton size="sm" variant="ghost" title="Zoom out" disabled={scale <= 0.6} onClick={() => setScale(value => Math.max(0.6, Number((value - 0.1).toFixed(1))))}><MinusIcon /></IconButton>
        <span>{Math.round(scale * 100)}%</span>
        <IconButton size="sm" variant="ghost" title="Zoom in" disabled={scale >= 2} onClick={() => setScale(value => Math.min(2, Number((value + 0.1).toFixed(1))))}><PlusIcon /></IconButton>
      </div>
    </div>
    <div ref={containerRef} onScroll={syncPageFromScroll} className="shd-scrollbar min-h-0 flex-1 overflow-auto p-4">
      <Document file={file} loading={<RendererLoading label="Rendering PDF" />} error={<RendererError message="Unable to render PDF" />} onLoadSuccess={({ numPages }) => { setPages(numPages); setPage(current => Math.min(current, numPages)); setRenderLimit(1); setRenderedPages(new Set()) }}>
        <div className="mx-auto flex w-fit flex-col gap-4">
          {Array.from({ length: pages ? Math.min(pages, renderLimit) : 1 }, (_, index) => {
            const pageNumber = index + 1
            return <div key={pageNumber} ref={element => { if (element) pageRefs.current.set(pageNumber, element); else pageRefs.current.delete(pageNumber) }} data-shd-pdf-page={pageNumber} className="overflow-hidden rounded-sm bg-white shadow-[0_18px_50px_rgba(0,0,0,0.32)]"><Page pageNumber={pageNumber} width={width * scale} renderTextLayer renderAnnotationLayer onRenderSuccess={() => { setRenderedPages(current => new Set(current).add(pageNumber)); if (pages) setRenderLimit(current => Math.min(pages, Math.max(current, pageNumber + 1))) }} /></div>
          })}
        </div>
      </Document>
    </div>
  </div>
}
