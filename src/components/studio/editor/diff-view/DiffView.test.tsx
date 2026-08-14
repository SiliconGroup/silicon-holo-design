import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { HoloDiffView } from './DiffView'

const before = 'const a = 1\nconst b = 2\nconst c = 3'
const after = 'const a = 1\nconst b = 20\nconst c = 3\nconst d = 4'

describe('HoloDiffView', () => {
  it('renders a split merge view with both side labels by default', async () => {
    const { container } = render(<HoloDiffView before={before} after={after} languageId="typescript" />)
    expect(screen.getByRole('group', { name: 'Difference view' })).toBeDefined()
    expect(screen.getByText('Before')).toBeDefined()
    expect(screen.getByText('After')).toBeDefined()
    await waitFor(() => expect(container.querySelector('.cm-mergeView')).not.toBeNull())
    expect(container.querySelectorAll('.cm-editor').length).toBe(2)
  })

  it('accepts custom side labels', async () => {
    render(<HoloDiffView before={before} after={after} beforeLabel="HEAD" afterLabel="Working tree" />)
    await waitFor(() => expect(screen.getByText('HEAD')).toBeDefined())
    expect(screen.getByText('Working tree')).toBeDefined()
  })

  it('renders a single editor and no side labels in unified layout', async () => {
    const { container } = render(<HoloDiffView before={before} after={after} layout="unified" />)
    await waitFor(() => expect(container.querySelector('.cm-editor')).not.toBeNull())
    expect(container.querySelectorAll('.cm-editor').length).toBe(1)
    expect(screen.queryByText('Before')).toBeNull()
  })

  it('is read-only by default', async () => {
    const { container } = render(<HoloDiffView before={before} after={after} />)
    await waitFor(() => expect(container.querySelector('.cm-content')).not.toBeNull())
    for (const content of container.querySelectorAll('.cm-content')) {
      expect(content.getAttribute('contenteditable')).toBe('false')
    }
  })

  it('can be made editable on the after side', async () => {
    const { container } = render(<HoloDiffView before={before} after={after} readOnly={false} />)
    await waitFor(() => expect(container.querySelectorAll('.cm-content').length).toBe(2))
    const editables = Array.from(container.querySelectorAll('.cm-content')).map(node => node.getAttribute('contenteditable'))
    expect(editables).toContain('true')
  })

  it('handles identical inputs without a diff', async () => {
    const { container } = render(<HoloDiffView before={before} after={before} />)
    await waitFor(() => expect(container.querySelector('.cm-mergeView')).not.toBeNull())
    expect(container.querySelector('.cm-changedLine')).toBeNull()
  })

  it('handles a pure insertion and a pure deletion', async () => {
    const { container, unmount } = render(<HoloDiffView before="" after={after} />)
    await waitFor(() => expect(container.querySelector('.cm-mergeView')).not.toBeNull())
    unmount()
    const removed = render(<HoloDiffView before={before} after="" />)
    await waitFor(() => expect(removed.container.querySelector('.cm-mergeView')).not.toBeNull())
  })

  it('applies line wrapping when requested', async () => {
    const { container } = render(<HoloDiffView before={before} after={after} wrap />)
    await waitFor(() => expect(container.querySelector('.cm-lineWrapping')).not.toBeNull())
  })

  it('keeps the scroll surface on the shared contracts', () => {
    const { container } = render(<HoloDiffView before={before} after={after} />)
    const host = container.querySelector('.shd-surface-inset')
    expect(host?.className).toContain('shd-scrollbar')
  })

  it('destroys the instance on unmount', async () => {
    const { container, unmount } = render(<HoloDiffView before={before} after={after} />)
    await waitFor(() => expect(container.querySelector('.cm-mergeView')).not.toBeNull())
    unmount()
    expect(container.querySelector('.cm-mergeView')).toBeNull()
  })

  it('lets the host container own scrolling, as @codemirror/merge requires', async () => {
    const { container } = render(<HoloDiffView before={before} after={after} />)
    await waitFor(() => expect(container.querySelector('.cm-mergeView')).not.toBeNull())
    // @codemirror/merge 强制两侧 height:auto!important 以保证同步滚动，
    // 因此滚动容器必须是我们自己的 host，而不是编辑器自身。
    const host = container.querySelector<HTMLElement>('.shd-surface-inset')
    expect(host?.className).toContain('shd-scrollbar')
    expect(host?.className).toContain('overflow-auto')
  })

  it('accepts a custom aria label', () => {
    render(<HoloDiffView before={before} after={after} ariaLabel="src/a.ts diff" />)
    expect(screen.getByRole('group', { name: 'src/a.ts diff' })).toBeDefined()
  })

  it('does not warn about unhandled rejections for an unknown language', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(<HoloDiffView before={before} after={after} languageId="nope" />)
    await waitFor(() => expect(container.querySelector('.cm-mergeView')).not.toBeNull())
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })
})
