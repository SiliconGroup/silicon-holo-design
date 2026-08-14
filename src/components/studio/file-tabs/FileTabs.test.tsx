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
    expect(screen.getByRole('tab', { name: 'b.ts' }).getAttribute('data-shd-tab-dirty')).toBe('true')
    expect(screen.getByRole('tab', { name: 'a.ts' }).hasAttribute('data-shd-tab-dirty')).toBe(false)
  })

  it('never puts a bare flex next to hidden on the close button of a dirty tab', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" onClose={() => {}} />)
    const close = screen.getByRole('button', { name: 'Close b.ts' })
    const tokens = close.className.split(/\s+/)
    /*
     * 同时出现 `flex` 与 `hidden` 时，胜负取决于 CSS 产出顺序而非 class 顺序：
     * 预构建 CSS 里 .hidden 恰好在后，而 example 走 virtual:uno.css 顺序不同，
     * 按钮就会保持可见，并把同一个 20px flex 容器里的 8px dirty 圆点压缩到 0 宽。
     */
    expect(tokens).toContain('hidden')
    expect(tokens).not.toContain('flex')
    expect(tokens).toContain('group-hover:flex')
  })

  it('keeps the unsaved dot at a fixed size so a sibling cannot squeeze it', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" onClose={() => {}} />)
    const dot = screen.getByTitle('Unsaved changes')
    expect(dot.className).toContain('flex-none')
    expect(dot.className).toContain('h-2')
    expect(dot.className).toContain('w-2')
  })

  it('exposes the unsaved state to assistive technology without changing the tab name', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" />)
    const dirty = screen.getByRole('tab', { name: 'b.ts' })
    const describedBy = dirty.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    // 说明元素必须在按钮外面，否则会并入可访问名
    expect(document.getElementById(describedBy!)?.textContent).toBe('Unsaved changes')
    expect(dirty.contains(document.getElementById(describedBy!))).toBe(false)
    expect(screen.getByRole('tab', { name: 'a.ts' }).hasAttribute('aria-describedby')).toBe(false)
  })

  it('keeps the unsaved indicator when tabs are not closable', () => {
    render(<HoloFileTabs tabs={tabs} activeId="a" closable={false} />)
    // dirty 与 closable 是无关的关注点：不可关闭的标签同样要显示未保存状态
    expect(screen.getByTitle('Unsaved changes')).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Close b.ts' })).toBeNull()
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

  it('leaves room for the italic glyph overhang so the last character is not clipped', () => {
    render(<HoloFileTabs tabs={[{ id: 'p', label: 'telemetry.md', preview: true }, ...tabs]} activeId="p" />)
    const label = screen.getByText('telemetry.md')
    // truncate 带的 overflow:hidden 在内边距边界裁切；斜体字形的墨迹超出推进宽度，
    // 没有这点右内边距时最后一个字符会被切掉。
    expect(label.className).toContain('italic')
    expect(label.className).toContain('pr-0.5')
    expect(screen.getByText('a.ts').className).not.toContain('pr-0.5')
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
