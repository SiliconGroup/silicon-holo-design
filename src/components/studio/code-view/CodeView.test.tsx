import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HoloCodeView } from './CodeView'

const source = 'const answer = 42\nfunction main() {\n  return answer\n}'

describe('HoloCodeView', () => {
  it('renders one row per source line inside a labelled region', () => {
    const { container } = render(<HoloCodeView value={source} languageId="typescript" />)
    expect(screen.getByRole('region', { name: 'Code' })).toBeDefined()
    expect(container.querySelectorAll('[data-shd-code-line]')).toHaveLength(4)
  })

  it('applies highlight.js markup for a known language', () => {
    const { container } = render(<HoloCodeView value={source} languageId="typescript" />)
    expect(container.querySelector('.hljs-keyword')).toBeDefined()
    expect(container.innerHTML).toContain('hljs-')
  })

  it('still highlights when the language is unknown', () => {
    const { container } = render(<HoloCodeView value={source} languageId="not-a-language" />)
    expect(container.querySelectorAll('[data-shd-code-line]')).toHaveLength(4)
  })

  it('shows line numbers by default and can hide them', () => {
    const { container, unmount } = render(<HoloCodeView value={source} />)
    expect(screen.getByText('4')).toBeDefined()
    expect(container.querySelector('[aria-hidden="true"]')).toBeDefined()
    unmount()
    render(<HoloCodeView value={source} showLineNumbers={false} />)
    expect(screen.queryByText('4')).toBeNull()
  })

  it('emphasises the requested lines', () => {
    const { container } = render(<HoloCodeView value={source} highlightLines={[2]} />)
    const rows = container.querySelectorAll('[data-shd-code-line]')
    expect(rows[1].className).toContain('bg-accent-primary-softer')
    expect(rows[0].className).not.toContain('bg-accent-primary-softer')
  })

  it('switches between pre and wrapped whitespace', () => {
    const { container, unmount } = render(<HoloCodeView value={source} />)
    expect(container.querySelector('code')?.className).toContain('whitespace-pre')
    unmount()
    const wrapped = render(<HoloCodeView value={source} wrap />)
    expect(wrapped.container.querySelector('code')?.className).toContain('whitespace-pre-wrap')
  })

  it('renders a placeholder and reports the overflow instead of the body', () => {
    const onExceedLimit = vi.fn()
    const { container } = render(<HoloCodeView value={'x'.repeat(2048)} maxRenderBytes={1024} onExceedLimit={onExceedLimit} />)
    expect(container.querySelectorAll('[data-shd-code-line]')).toHaveLength(0)
    expect(screen.getByText(/exceeds the 1 KB preview limit/)).toBeDefined()
    expect(onExceedLimit).toHaveBeenCalledWith(2048)
  })

  it('prefers a supplied byteSize over measuring the string', () => {
    const onExceedLimit = vi.fn()
    render(<HoloCodeView value="tiny" byteSize={5_000_000} maxRenderBytes={1024} onExceedLimit={onExceedLimit} />)
    expect(onExceedLimit).toHaveBeenCalledWith(5_000_000)
    expect(screen.getByText(/exceeds the 1 KB preview limit/)).toBeDefined()
  })

  it('stays under the limit for ordinary files', () => {
    const onExceedLimit = vi.fn()
    render(<HoloCodeView value={source} onExceedLimit={onExceedLimit} />)
    expect(onExceedLimit).not.toHaveBeenCalled()
  })

  it('warns in development when asked to be editable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<HoloCodeView value={source} readOnly={false} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('HoloCodeEditor'))
    warn.mockRestore()
  })

  it('never invokes edit callbacks', () => {
    const onChange = vi.fn()
    const onSaveIntent = vi.fn()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<HoloCodeView value={source} readOnly={false} onChange={onChange} onSaveIntent={onSaveIntent} />)
    expect(onChange).not.toHaveBeenCalled()
    expect(onSaveIntent).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('uses the shared scrollbar and inset surface contracts', () => {
    render(<HoloCodeView value={source} />)
    const region = screen.getByRole('region', { name: 'Code' })
    expect(region.className).toContain('shd-scrollbar')
    expect(region.className).toContain('shd-surface-inset')
  })

  it('does not scroll when the revealed line is already visible', () => {
    const { container } = render(<HoloCodeView value={source} revealLine={2} />)
    const region = screen.getByRole('region', { name: 'Code' })
    // 之前用 offsetTop（相对最近的定位祖先）判断可见性，会把已经可见的行也滚走，
    // 表现为代码视图初始就停在第 2 行而不是第 1 行。
    expect(region.scrollTop).toBe(0)
    expect(container.querySelector('[data-shd-code-line="2"]')).not.toBeNull()
  })

  it('accepts a custom aria label', () => {
    render(<HoloCodeView value={source} ariaLabel="src/main.ts" />)
    expect(screen.getByRole('region', { name: 'src/main.ts' })).toBeDefined()
  })
})
