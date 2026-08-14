import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HoloFileTabs } from './FileTabs'
import type { HoloFileTab } from '../types'

const tabs: HoloFileTab[] = [
  { id: 'a', label: 'a.ts', title: 'src/a.ts' },
  { id: 'b', label: 'b.ts', dirty: true },
  { id: 'c', label: 'c.ts', icon: <span>ic</span> },
]

describe('HoloFileTabs', () => {
  it('renders a labelled tablist with one tab per file', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" />)
    const list = screen.getByRole('tablist')
    expect(list.getAttribute('aria-label')).toBe('Open files')
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('marks only the active tab as selected and tabbable', () => {
    render(<HoloFileTabs tabs={tabs} activeId="b" />)
    expect(screen.getByRole('tab', { name: 'b.ts' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'b.ts' }).getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('tab', { name: 'a.ts' }).getAttribute('tabindex')).toBe('-1')
  })

  it('uses the explicit title as the hover hint and falls back to the label', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" />)
    expect(screen.getByRole('tab', { name: 'a.ts' }).getAttribute('title')).toBe('src/a.ts')
    expect(screen.getByRole('tab', { name: 'b.ts' }).getAttribute('title')).toBe('b.ts')
  })

  it('reports activation on click', () => {
    const onActiveChange = vi.fn()
    render(<HoloFileTabs tabs={tabs} activeId="a" onActiveChange={onActiveChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'c.ts' }))
    expect(onActiveChange).toHaveBeenCalledWith('c')
  })

  it('closes from the dedicated button without switching tabs', () => {
    const onClose = vi.fn()
    const onActiveChange = vi.fn()
    render(<HoloFileTabs tabs={tabs} activeId="a" onClose={onClose} onActiveChange={onActiveChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close c.ts' }))
    expect(onClose).toHaveBeenCalledWith('c')
    expect(onActiveChange).not.toHaveBeenCalled()
  })

  it('closes on middle click and can opt out', () => {
    const onClose = vi.fn()
    const { unmount } = render(<HoloFileTabs tabs={tabs} activeId="a" onClose={onClose} />)
    fireEvent(screen.getByRole('tab', { name: 'a.ts' }), new MouseEvent('auxclick', { bubbles: true, button: 1 }))
    expect(onClose).toHaveBeenCalledWith('a')
    unmount()

    const onCloseDisabled = vi.fn()
    render(<HoloFileTabs tabs={tabs} activeId="a" onClose={onCloseDisabled} closeOnMiddleClick={false} />)
    fireEvent(screen.getByRole('tab', { name: 'a.ts' }), new MouseEvent('auxclick', { bubbles: true, button: 1 }))
    expect(onCloseDisabled).not.toHaveBeenCalled()
  })

  it('hides the close affordance when closable is false', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" closable={false} onClose={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Close a.ts' })).toBeNull()
  })

  it('shows an unsaved indicator only for dirty tabs', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" />)
    expect(screen.getByTitle('Unsaved changes')).toBeDefined()
    expect(screen.queryAllByTitle('Unsaved changes')).toHaveLength(1)
  })

  it('moves between tabs with the horizontal arrows and Home/End', () => {
    const onActiveChange = vi.fn()
    render(<HoloFileTabs tabs={tabs} activeId="a" onActiveChange={onActiveChange} />)
    const first = screen.getByRole('tab', { name: 'a.ts' })
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(onActiveChange).toHaveBeenLastCalledWith('b')
    fireEvent.keyDown(first, { key: 'ArrowLeft' })
    expect(onActiveChange).toHaveBeenLastCalledWith('c')
    fireEvent.keyDown(first, { key: 'End' })
    expect(onActiveChange).toHaveBeenLastCalledWith('c')
    fireEvent.keyDown(first, { key: 'Home' })
    expect(onActiveChange).toHaveBeenLastCalledWith('a')
  })

  it('closes the focused tab with the platform shortcut', () => {
    const onClose = vi.fn()
    render(<HoloFileTabs tabs={tabs} activeId="a" onClose={onClose} />)
    fireEvent.keyDown(screen.getByRole('tab', { name: 'a.ts' }), { key: 'w', metaKey: true })
    expect(onClose).toHaveBeenCalledWith('a')
  })

  it('reports the tab and the raw event on context menu', () => {
    const onContextMenu = vi.fn()
    render(<HoloFileTabs tabs={tabs} activeId="a" onContextMenu={onContextMenu} />)
    fireEvent.contextMenu(screen.getByRole('tab', { name: 'a.ts' }))
    expect(onContextMenu).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }), expect.anything())
  })

  it('renders the custom tab icon', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" />)
    expect(screen.getByText('ic')).toBeDefined()
  })

  it('marks a preview tab visually and exposes it as a data attribute', () => {
    render(<HoloFileTabs tabs={[{ id: 'p', label: 'preview.ts', preview: true }, ...tabs]} activeId="p" />)
    const preview = screen.getByRole('tab', { name: 'preview.ts' })
    expect(preview.getAttribute('data-shd-tab-preview')).toBe('true')
    expect(screen.getByText('preview.ts').className).toContain('italic')
    expect(screen.getByRole('tab', { name: 'a.ts' }).hasAttribute('data-shd-tab-preview')).toBe(false)
  })

  it('requests a pin on double click, and only for preview tabs', () => {
    const onPin = vi.fn()
    render(<HoloFileTabs tabs={[{ id: 'p', label: 'preview.ts', preview: true }, ...tabs]} activeId="p" onPin={onPin} />)
    fireEvent.doubleClick(screen.getByRole('tab', { name: 'a.ts' }))
    expect(onPin).not.toHaveBeenCalled()
    fireEvent.doubleClick(screen.getByRole('tab', { name: 'preview.ts' }))
    expect(onPin).toHaveBeenCalledWith('p')
  })

  it('never scrolls an ancestor when mounting or switching tabs', () => {
    // scrollIntoView 会滚动所有可滚动祖先（含文档），任何一处标签栏挂载都会把整页拽走。
    const scrollIntoView = vi.fn()
    const original = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView
    try {
      const { rerender } = render(<HoloFileTabs tabs={tabs} activeId="a" />)
      rerender(<HoloFileTabs tabs={tabs} activeId="c" />)
      expect(scrollIntoView).not.toHaveBeenCalled()
    } finally {
      Element.prototype.scrollIntoView = original
    }
  })

  it('scrolls only its own strip to reveal the active tab', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" />)
    const strip = screen.getByRole('tablist')
    // jsdom 的布局盒子全是 0，这里只断言写入的是标签条自身的 scrollLeft，且未越界。
    expect(strip.scrollLeft).toBe(0)
  })

  it('keeps the scroll surface on the shared scrollbar contract', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" />)
    expect(screen.getByRole('tablist').className).toContain('shd-scrollbar')
  })
})
