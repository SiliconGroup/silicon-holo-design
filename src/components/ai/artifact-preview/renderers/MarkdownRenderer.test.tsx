import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MarkdownRenderer } from './MarkdownRenderer'

vi.mock('mermaid', () => ({ default: { initialize: vi.fn(), render: vi.fn().mockResolvedValue({ svg: '<svg aria-label="diagram"></svg>' }) } }))
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
  fillStyle: '',
  fillRect: vi.fn(),
  getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray([1, 2, 3, 255]) }),
} as unknown as CanvasRenderingContext2D)

describe('MarkdownRenderer', () => {
  it('loads URL Markdown and renders GFM, math, code, and Mermaid', async () => {
    const content = '# Preview\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n$$x^2+y^2=z^2$$\n\n```ts\nconst ready = true\n```\n\n```mermaid\nflowchart LR\nA-->B\n```'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(content))
    const { container } = render(<MarkdownRenderer artifact={{ id: 'markdown', type: 'markdown', content: '', source: { kind: 'url', url: '/fixture.md' } }} />)
    expect(await screen.findByRole('heading', { name: 'Preview' })).toBeDefined()
    expect(container.querySelector('[data-shd-artifact-renderer="markdown"]')?.className).toContain('box-border')
    expect(container.querySelector('table')).not.toBeNull()
    expect(container.querySelector('.katex')).not.toBeNull()
    expect(container.querySelector('.hljs-keyword')).not.toBeNull()
    await waitFor(() => expect(container.querySelector('[data-shd-mermaid="ready"] svg')).not.toBeNull())
    fetchMock.mockRestore()
  })
})
