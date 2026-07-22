import { StrictMode, useRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const documentFiles = vi.hoisted(() => [] as unknown[])
const globalWorkerOptions = vi.hoisted(() => ({ workerPort: null as Worker | null, workerSrc: '' }))
const createObjectURL = vi.hoisted(() => vi.fn(() => 'blob:pdf-worker'))
const workerConstructor = vi.hoisted(() => vi.fn())

vi.mock('react-pdf', () => ({
  pdfjs: { GlobalWorkerOptions: globalWorkerOptions },
  Document: ({ children, file, onLoadSuccess }: { children: React.ReactNode; file: unknown; onLoadSuccess: (value: { numPages: number }) => void }) => {
    documentFiles.push(file)
    const loaded = useRef(false)
    if (!loaded.current) {
      loaded.current = true
      queueMicrotask(() => onLoadSuccess({ numPages: 3 }))
    }
    return <div data-testid="pdf-document">{children}</div>
  },
  Page: ({ pageNumber, onRenderSuccess }: { pageNumber: number; onRenderSuccess: () => void }) => {
    const rendered = useRef(false)
    const onRenderSuccessRef = useRef(onRenderSuccess)
    onRenderSuccessRef.current = onRenderSuccess
    if (!rendered.current) {
      rendered.current = true
      setTimeout(() => onRenderSuccessRef.current(), 0)
    }
    return <div>Rendered PDF page {pageNumber}</div>
  },
}))
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?raw', () => ({ default: 'pdf worker source' }))

class ResizeObserverMock {
  observe() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
vi.stubGlobal('Worker', class WorkerMock {
  constructor(url: string, options?: WorkerOptions) { workerConstructor(url, options) }
})
URL.createObjectURL = createObjectURL
const scrollIntoView = vi.fn()
Element.prototype.scrollIntoView = scrollIntoView

beforeEach(async () => {
  documentFiles.length = 0
  createObjectURL.mockClear()
  workerConstructor.mockClear()
  scrollIntoView.mockClear()
  globalWorkerOptions.workerPort = null
  globalWorkerOptions.workerSrc = ''
  const { configureArtifactPdfWorker } = await import('../pdf-worker-config')
  configureArtifactPdfWorker({})
})

describe('PdfRenderer', () => {
  it('accepts a legacy URL artifact, lazily creates the inline worker URL, and renders a continuous page flow', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const { PdfRenderer } = await import('./PdfRenderer')
    expect(createObjectURL).not.toHaveBeenCalled()
    render(<PdfRenderer artifact={{ id: 'pdf', type: 'pdf', content: '/fixture.pdf' }} />)
    expect(await screen.findByText('1 / 3')).toBeDefined()
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(workerConstructor).toHaveBeenCalledWith('blob:pdf-worker', { type: 'module' })
    expect(globalWorkerOptions.workerPort).not.toBeNull()
    expect(documentFiles.every(file => file === '/fixture.pdf')).toBe(true)
    const next = screen.getByRole('button', { name: 'Next page' })
    expect(next.className).toContain('flex-center')
    expect(screen.getByRole('button', { name: 'Zoom in' }).className).toContain('flex-center')
    expect(screen.getByText('Rendered PDF page 1')).toBeDefined()
    expect(await screen.findByText('Rendered PDF page 2')).toBeDefined()
    expect(await screen.findByText('Rendered PDF page 3')).toBeDefined()
    fireEvent.click(next)
    expect(screen.getByText('2 / 3')).toBeDefined()
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
    expect(fetchMock).not.toHaveBeenCalled()
    fetchMock.mockRestore()
  })

  it('keeps one stable Blob file across ArrayBuffer rerenders without detaching the caller buffer', async () => {
    const data = new Uint8Array([37, 80, 68, 70, 45, 49]).buffer
    const artifact = { id: 'buffer-pdf', type: 'pdf', content: '', mimeType: 'application/pdf', source: { kind: 'arrayBuffer' as const, data } }
    const { PdfRenderer } = await import('./PdfRenderer')
    render(<StrictMode><PdfRenderer artifact={artifact} /></StrictMode>)
    expect(await screen.findByText('1 / 3')).toBeDefined()
    const blob = documentFiles.find(file => file instanceof Blob)
    expect(blob).toBeInstanceOf(Blob)
    expect(documentFiles.filter(file => file instanceof Blob).every(file => file === blob)).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await waitFor(() => expect(screen.getByText('110%')).toBeDefined())
    expect(documentFiles.filter(file => file instanceof Blob).every(file => file === blob)).toBe(true)
    expect(data.byteLength).toBe(6)
  })

  it('passes Blob sources through without creating a replacement file', async () => {
    const blob = new Blob(['%PDF-1'], { type: 'application/pdf' })
    const { PdfRenderer } = await import('./PdfRenderer')
    render(<PdfRenderer artifact={{ id: 'blob-pdf', type: 'pdf', content: '', source: { kind: 'blob', blob } }} />)
    expect(await screen.findByText('1 / 3')).toBeDefined()
    expect(documentFiles.every(file => file === blob)).toBe(true)
  })

  it('honors a host-provided worker port without constructing the inline worker', async () => {
    const configuredWorker = {} as Worker
    const { configureArtifactPdfWorker } = await import('../pdf-worker-config')
    const { PdfRenderer } = await import('./PdfRenderer')
    configureArtifactPdfWorker({ workerPort: configuredWorker })
    render(<PdfRenderer artifact={{ id: 'configured-pdf', type: 'pdf', content: '/fixture.pdf' }} />)
    expect(await screen.findByText('1 / 3')).toBeDefined()
    expect(globalWorkerOptions.workerPort).toBe(configuredWorker)
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(workerConstructor).not.toHaveBeenCalled()
  })

  it('honors a host-provided worker URL without constructing the inline worker', async () => {
    const { configureArtifactPdfWorker } = await import('../pdf-worker-config')
    const { PdfRenderer } = await import('./PdfRenderer')
    configureArtifactPdfWorker({ workerSrc: '/workers/pdf.worker.mjs' })
    render(<PdfRenderer artifact={{ id: 'configured-src-pdf', type: 'pdf', content: '/fixture.pdf' }} />)
    expect(await screen.findByText('1 / 3')).toBeDefined()
    expect(globalWorkerOptions.workerPort).toBeNull()
    expect(globalWorkerOptions.workerSrc).toBe('/workers/pdf.worker.mjs')
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(workerConstructor).not.toHaveBeenCalled()
  })
})
