import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('react-pdf', () => ({
  pdfjs: { GlobalWorkerOptions: {} },
  Document: ({ children, onLoadSuccess }: { children: React.ReactNode; onLoadSuccess: (value: { numPages: number }) => void }) => {
    queueMicrotask(() => onLoadSuccess({ numPages: 3 }))
    return <div data-testid="pdf-document">{children}</div>
  },
  Page: ({ pageNumber, onRenderSuccess }: { pageNumber: number; onRenderSuccess: () => void }) => {
    queueMicrotask(onRenderSuccess)
    return <div>Rendered PDF page {pageNumber}</div>
  },
}))
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?worker', () => ({ default: class PdfWorkerMock {} }))

class ResizeObserverMock {
  observe() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
const scrollIntoView = vi.fn()
Element.prototype.scrollIntoView = scrollIntoView

describe('PdfRenderer', () => {
  it('accepts a legacy URL artifact, renders a continuous page flow, and exposes standard controls', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const { PdfRenderer } = await import('./PdfRenderer')
    render(<PdfRenderer artifact={{ id: 'pdf', type: 'pdf', content: '/fixture.pdf' }} />)
    expect(await screen.findByText('1 / 3')).toBeDefined()
    const next = screen.getByRole('button', { name: 'Next page' })
    expect(next.className).toContain('flex-center')
    expect(screen.getByRole('button', { name: 'Zoom in' }).className).toContain('flex-center')
    expect(screen.getByText('Rendered PDF page 1')).toBeDefined()
    expect(screen.getByText('Rendered PDF page 2')).toBeDefined()
    expect(await screen.findByText('Rendered PDF page 3')).toBeDefined()
    fireEvent.click(next)
    expect(screen.getByText('2 / 3')).toBeDefined()
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
    expect(fetchMock).not.toHaveBeenCalled()
    fetchMock.mockRestore()
  })
})
