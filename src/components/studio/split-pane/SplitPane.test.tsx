import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { HoloSplitPane } from './SplitPane'

/** jsdom 不实现 ResizeObserver，这里用可手动触发的替身来验证 clamp 行为。 */
function installResizeObserver() {
  const callbacks = new Set<(entries: { contentRect: { width: number; height: number } }[]) => void>()
  class MockResizeObserver {
    constructor(private readonly callback: (entries: { contentRect: { width: number; height: number } }[]) => void) {
      callbacks.add(this.callback)
    }
    observe() {}
    disconnect() { callbacks.delete(this.callback) }
  }
  ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver = MockResizeObserver
  return {
    emit(width: number) {
      for (const callback of callbacks) callback([{ contentRect: { width, height: width } }])
    },
    teardown() {
      callbacks.clear()
      delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver
    },
  }
}

const panes: [React.ReactNode, React.ReactNode] = [<div key="a">First</div>, <div key="b">Second</div>]

describe('HoloSplitPane', () => {
  it('exposes a keyboard operable separator with range semantics', () => {
    render(<HoloSplitPane defaultSize={200} minSize={100} maxSize={400}>{panes}</HoloSplitPane>)
    const separator = screen.getByRole('separator')
    expect(separator.getAttribute('aria-orientation')).toBe('vertical')
    expect(separator.getAttribute('aria-valuenow')).toBe('200')
    expect(separator.getAttribute('aria-valuemin')).toBe('100')
    expect(separator.getAttribute('aria-valuemax')).toBe('400')
    expect(separator.getAttribute('tabindex')).toBe('0')
    expect(separator.getAttribute('aria-label')).toBe('Resize panel')
  })

  it('switches the separator orientation for a vertical split', () => {
    render(<HoloSplitPane direction="vertical">{panes}</HoloSplitPane>)
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal')
  })

  it('moves by 8px and accelerates to 32px with shift', () => {
    const onSizeChange = vi.fn()
    render(<HoloSplitPane defaultSize={200} minSize={100} maxSize={400} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
    const separator = screen.getByRole('separator')
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(onSizeChange).toHaveBeenLastCalledWith(208)
    fireEvent.keyDown(separator, { key: 'ArrowLeft', shiftKey: true })
    expect(onSizeChange).toHaveBeenLastCalledWith(176)
  })

  it('uses the perpendicular arrows for a vertical split', () => {
    const onSizeChange = vi.fn()
    render(<HoloSplitPane direction="vertical" defaultSize={200} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
    const separator = screen.getByRole('separator')
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(onSizeChange).not.toHaveBeenCalled()
    fireEvent.keyDown(separator, { key: 'ArrowDown' })
    expect(onSizeChange).toHaveBeenLastCalledWith(208)
  })

  it('jumps to the bounds with Home and End', () => {
    const onSizeChange = vi.fn()
    render(<HoloSplitPane defaultSize={200} minSize={120} maxSize={360} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
    const separator = screen.getByRole('separator')
    fireEvent.keyDown(separator, { key: 'Home' })
    expect(onSizeChange).toHaveBeenLastCalledWith(120)
    fireEvent.keyDown(separator, { key: 'End' })
    expect(onSizeChange).toHaveBeenLastCalledWith(360)
  })

  it('resets to the default size with Enter and on double click', () => {
    const onSizeChange = vi.fn()
    render(<HoloSplitPane size={300} defaultSize={200} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
    const separator = screen.getByRole('separator')
    fireEvent.keyDown(separator, { key: 'Enter' })
    expect(onSizeChange).toHaveBeenLastCalledWith(200)
    fireEvent.doubleClick(separator)
    expect(onSizeChange).toHaveBeenLastCalledWith(200)
  })

  it('can opt out of the double click reset', () => {
    const onSizeChange = vi.fn()
    render(<HoloSplitPane size={300} defaultSize={200} resetOnDoubleClick={false} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
    fireEvent.doubleClick(screen.getByRole('separator'))
    expect(onSizeChange).not.toHaveBeenCalled()
  })

  it('clamps the reported size to the configured bounds', () => {
    const onSizeChange = vi.fn()
    render(<HoloSplitPane size={110} minSize={100} maxSize={400} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
    const separator = screen.getByRole('separator')
    fireEvent.keyDown(separator, { key: 'ArrowLeft', shiftKey: true })
    expect(onSizeChange).toHaveBeenLastCalledWith(100)
  })

  it('does not mutate a controlled size internally', () => {
    render(<HoloSplitPane size={240} minSize={100} maxSize={400} onSizeChange={() => {}}>{panes}</HoloSplitPane>)
    const separator = screen.getByRole('separator')
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(separator.getAttribute('aria-valuenow')).toBe('240')
  })

  it('ignores unrelated keys', () => {
    const onSizeChange = vi.fn()
    render(<HoloSplitPane defaultSize={200} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'PageUp' })
    expect(onSizeChange).not.toHaveBeenCalled()
  })

  it('clamps to the container at render time and restores the intended size when it grows back', () => {
    const observer = installResizeObserver()
    try {
      const onSizeChange = vi.fn()
      render(<HoloSplitPane defaultSize={400} minSize={100} maxSize={800} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
      const separator = screen.getByRole('separator')
      expect(separator.getAttribute('aria-valuenow')).toBe('400')

      // 容器缩到 300px：可用上限变成 300 - minSize = 200，呈现值随之收窄
      act(() => observer.emit(300))
      expect(separator.getAttribute('aria-valuenow')).toBe('200')

      // 容器恢复：回到用户原本的意图值，而不是停在 clamp 结果上
      act(() => observer.emit(800))
      expect(separator.getAttribute('aria-valuenow')).toBe('400')
    } finally {
      observer.teardown()
    }
  })

  it('never rewrites the host size for a pure container resize', () => {
    const observer = installResizeObserver()
    try {
      const onSizeChange = vi.fn()
      render(<HoloSplitPane size={400} minSize={100} maxSize={800} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
      act(() => observer.emit(300))
      act(() => observer.emit(260))
      act(() => observer.emit(800))
      // clamp 是呈现层行为。把它写回宿主会让一次瞬时的偏小测量永久改写用户尺寸，
      // 表现为界面上出现 120.8828125px 这类无法复原的小数值。
      expect(onSizeChange).not.toHaveBeenCalled()
    } finally {
      observer.teardown()
    }
  })

  it('snaps the size to whole pixels', () => {
    const onSizeChange = vi.fn()
    render(<HoloSplitPane defaultSize={200.7} minSize={100} maxSize={400} onSizeChange={onSizeChange}>{panes}</HoloSplitPane>)
    const separator = screen.getByRole('separator')
    // 小数尺寸会让分隔条落在半像素上，看起来与相邻边框错位。
    expect(separator.getAttribute('aria-valuenow')).toBe('201')
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(onSizeChange).toHaveBeenLastCalledWith(209)
    expect(Number.isInteger(onSizeChange.mock.calls[0][0])).toBe(true)
  })

  it('renders both panes', () => {
    render(<HoloSplitPane>{panes}</HoloSplitPane>)
    expect(screen.getByText('First')).toBeDefined()
    expect(screen.getByText('Second')).toBeDefined()
  })
})
