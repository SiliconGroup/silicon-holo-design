import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { HoloTree } from './Tree'
import type { HoloTreeNode } from '../types'

const nodes: HoloTreeNode[] = [
  { id: 'src', label: 'src', kind: 'branch' },
  { id: 'src/a.ts', label: 'a.ts', kind: 'leaf', parentId: 'src' },
  { id: 'src/b.ts', label: 'b.ts', kind: 'leaf', parentId: 'src' },
  { id: 'README.md', label: 'README.md', kind: 'leaf' },
]

function ControlledTree(props: Partial<React.ComponentProps<typeof HoloTree>> & { initialExpanded?: string[] }) {
  const { initialExpanded = [], ...rest } = props
  const [expanded, setExpanded] = useState<string[]>(initialExpanded)
  const [selected, setSelected] = useState<string[]>([])
  return (
    <HoloTree
      nodes={nodes}
      expandedIds={expanded}
      onExpandedChange={setExpanded}
      selectedIds={selected}
      onSelectedChange={setSelected}
      {...rest}
    />
  )
}

const treeRowOf = (name: string) => screen.getByRole('treeitem', { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) })
const rowByName = (name: string) => screen.getByRole('treeitem', { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) })

describe('HoloTree', () => {
  it('renders a labelled tree and only root rows when collapsed', () => {
    render(<ControlledTree />)
    const tree = screen.getByRole('tree')
    expect(tree.getAttribute('aria-label')).toBe('Project tree')
    expect(tree.getAttribute('aria-multiselectable')).toBe('false')
    expect(screen.getAllByRole('treeitem')).toHaveLength(2)
  })

  it('exposes level, selection and expansion state per row', () => {
    render(<ControlledTree initialExpanded={['src']} />)
    const src = rowByName('src')
    expect(src.getAttribute('aria-level')).toBe('1')
    expect(src.getAttribute('aria-expanded')).toBe('true')
    expect(src.getAttribute('aria-selected')).toBe('false')
    expect(rowByName('a.ts').getAttribute('aria-level')).toBe('2')
    expect(rowByName('a.ts').hasAttribute('aria-expanded')).toBe(false)
  })

  it('toggles a branch on click and reports selection', () => {
    render(<ControlledTree />)
    fireEvent.click(rowByName('src'))
    expect(screen.getAllByRole('treeitem')).toHaveLength(4)
    expect(rowByName('src').getAttribute('aria-selected')).toBe('true')
    fireEvent.click(rowByName('src'))
    expect(screen.getAllByRole('treeitem')).toHaveLength(2)
  })

  it('always toggles a branch on click, independently of activateOn', () => {
    const onActivate = vi.fn()
    render(<ControlledTree onActivate={onActivate} activateOn="click" />)
    fireEvent.click(treeRowOf('src'))
    // 单击 branch 既激活也展开：activateOn 只决定是否上报激活，不影响展开语义。
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'src' }))
    expect(screen.getAllByRole('treeitem')).toHaveLength(4)
    fireEvent.click(treeRowOf('src'))
    expect(screen.getAllByRole('treeitem')).toHaveLength(2)
  })

  it('reports a pinned activation on double click in click mode', () => {
    const onActivate = vi.fn()
    const onActivatePinned = vi.fn()
    render(<ControlledTree activateOn="click" onActivate={onActivate} onActivatePinned={onActivatePinned} initialExpanded={['src']} />)
    fireEvent.click(treeRowOf('a.ts'))
    expect(onActivate).toHaveBeenCalledTimes(1)
    expect(onActivatePinned).not.toHaveBeenCalled()
    fireEvent.doubleClick(treeRowOf('a.ts'))
    expect(onActivatePinned).toHaveBeenCalledWith(expect.objectContaining({ id: 'src/a.ts' }))
  })

  it('keeps double click as a plain activation in the default mode', () => {
    const onActivate = vi.fn()
    const onActivatePinned = vi.fn()
    render(<ControlledTree onActivate={onActivate} onActivatePinned={onActivatePinned} initialExpanded={['src']} />)
    fireEvent.doubleClick(treeRowOf('a.ts'))
    expect(onActivate).toHaveBeenCalledTimes(1)
    expect(onActivatePinned).not.toHaveBeenCalled()
  })

  it('shows the row focus frame for keyboard interaction only', () => {
    render(<ControlledTree />)
    const tree = screen.getByRole('tree')
    fireEvent.pointerDown(tree)
    act(() => tree.focus())
    fireEvent.click(treeRowOf('README.md'))
    expect(treeRowOf('README.md').className).not.toContain('shd-focus-frame')
    fireEvent.keyDown(tree, { key: 'ArrowUp' })
    expect(treeRowOf('src').className).toContain('shd-focus-frame')
  })

  it('restores the keyboard focus frame after a pointer click on an already focused tree', () => {
    render(<ControlledTree />)
    const tree = screen.getByRole('tree')
    act(() => tree.focus())
    fireEvent.keyDown(tree, { key: 'ArrowDown' })
    expect(treeRowOf('README.md').className).toContain('shd-focus-frame')

    // 容器已有焦点时的 pointerdown 不会再产生 focus 事件；离开再用键盘回来必须重新显示焦点框。
    fireEvent.pointerDown(tree)
    fireEvent.click(treeRowOf('src'))
    expect(treeRowOf('src').className).not.toContain('shd-focus-frame')
    // React 把 onBlur/onFocus 映射到 focusout/focusin
    fireEvent.focusOut(tree, { relatedTarget: document.body })
    fireEvent.focusIn(tree)
    expect(treeRowOf('src').className).toContain('shd-focus-frame')
  })

  it('activates on double click by default and on click when configured', () => {
    const onActivate = vi.fn()
    const { unmount } = render(<ControlledTree onActivate={onActivate} initialExpanded={['src']} />)
    fireEvent.click(rowByName('a.ts'))
    expect(onActivate).not.toHaveBeenCalled()
    fireEvent.doubleClick(rowByName('a.ts'))
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'src/a.ts' }))
    unmount()

    const onClickActivate = vi.fn()
    render(<ControlledTree onActivate={onClickActivate} activateOn="click" initialExpanded={['src']} />)
    fireEvent.click(rowByName('b.ts'))
    expect(onClickActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'src/b.ts' }))
  })

  it('drives the active descendant with the vertical arrows', () => {
    render(<ControlledTree initialExpanded={['src']} />)
    const tree = screen.getByRole('tree')
    act(() => tree.focus())
    fireEvent.keyDown(tree, { key: 'ArrowDown' })
    expect(tree.getAttribute('aria-activedescendant')).toBe(rowByName('a.ts').id)
    fireEvent.keyDown(tree, { key: 'End' })
    expect(tree.getAttribute('aria-activedescendant')).toBe(rowByName('README.md').id)
    fireEvent.keyDown(tree, { key: 'Home' })
    expect(tree.getAttribute('aria-activedescendant')).toBe(rowByName('src').id)
  })

  it('expands with ArrowRight and collapses with ArrowLeft', () => {
    render(<ControlledTree />)
    const tree = screen.getByRole('tree')
    act(() => tree.focus())
    fireEvent.keyDown(tree, { key: 'ArrowRight' })
    expect(rowByName('src').getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(tree, { key: 'ArrowLeft' })
    expect(rowByName('src').getAttribute('aria-expanded')).toBe('false')
  })

  it('activates the active descendant with Enter', () => {
    const onActivate = vi.fn()
    render(<ControlledTree onActivate={onActivate} />)
    const tree = screen.getByRole('tree')
    act(() => tree.focus())
    fireEvent.keyDown(tree, { key: 'Enter' })
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'src' }))
  })

  it('jumps to a row by first letter', () => {
    render(<ControlledTree />)
    const tree = screen.getByRole('tree')
    act(() => tree.focus())
    fireEvent.keyDown(tree, { key: 'R' })
    expect(tree.getAttribute('aria-activedescendant')).toBe(rowByName('README.md').id)
  })

  it('supports additive and range selection only when multiple is enabled', () => {
    const onSelectedChange = vi.fn()
    const { unmount } = render(
      <HoloTree nodes={nodes} expandedIds={['src']} onExpandedChange={() => {}} selectedIds={['src']} onSelectedChange={onSelectedChange} />,
    )
    fireEvent.click(rowByName('a.ts'), { metaKey: true })
    expect(onSelectedChange).toHaveBeenLastCalledWith(['src/a.ts'])
    unmount()

    const onMultiChange = vi.fn()
    render(
      <HoloTree nodes={nodes} expandedIds={['src']} onExpandedChange={() => {}} selectedIds={['src']} onSelectedChange={onMultiChange} multiple />,
    )
    expect(screen.getByRole('tree').getAttribute('aria-multiselectable')).toBe('true')
    fireEvent.click(rowByName('a.ts'), { metaKey: true })
    expect(onMultiChange).toHaveBeenLastCalledWith(['src', 'src/a.ts'])
    fireEvent.click(rowByName('b.ts'), { shiftKey: true })
    expect(onMultiChange).toHaveBeenLastCalledWith(['src/a.ts', 'src/b.ts'])
  })

  it('ignores interaction on disabled rows', () => {
    const onActivate = vi.fn()
    const onSelectedChange = vi.fn()
    render(
      <HoloTree
        nodes={[{ id: 'locked', label: 'locked', kind: 'leaf', disabled: true }]}
        expandedIds={[]}
        onExpandedChange={() => {}}
        onSelectedChange={onSelectedChange}
        onActivate={onActivate}
      />,
    )
    const row = screen.getByRole('treeitem')
    expect(row.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(row)
    fireEvent.doubleClick(row)
    expect(onActivate).not.toHaveBeenCalled()
    expect(onSelectedChange).not.toHaveBeenCalled()
  })

  it('renames inline with F2 and cancels with Escape', () => {
    const onRename = vi.fn()
    const { unmount } = render(<ControlledTree onRename={onRename} />)
    const tree = screen.getByRole('tree')
    act(() => tree.focus())
    fireEvent.keyDown(tree, { key: 'F2' })
    const input = screen.getByRole('textbox', { name: 'Rename' })
    fireEvent.change(input, { target: { value: 'source' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onRename).toHaveBeenCalledWith(expect.objectContaining({ id: 'src' }), 'source')
    unmount()

    const onCancelled = vi.fn()
    render(<ControlledTree onRename={onCancelled} />)
    const secondTree = screen.getByRole('tree')
    act(() => secondTree.focus())
    fireEvent.keyDown(secondTree, { key: 'F2' })
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Rename' }), { key: 'Escape' })
    expect(onCancelled).not.toHaveBeenCalled()
  })

  it('renders the empty state and honours custom empty content', () => {
    const { unmount } = render(<HoloTree nodes={[]} expandedIds={[]} onExpandedChange={() => {}} />)
    expect(screen.getByText('Nothing to show')).toBeDefined()
    expect(screen.queryByRole('tree')).toBeNull()
    unmount()
    render(<HoloTree nodes={[]} expandedIds={[]} onExpandedChange={() => {}} emptyContent={<p>No project</p>} />)
    expect(screen.getByText('No project')).toBeDefined()
  })

  it('marks a loading row as busy', () => {
    render(
      <HoloTree
        nodes={[{ id: 'src', label: 'src', kind: 'branch', loading: true, expandable: true }]}
        expandedIds={[]}
        onExpandedChange={() => {}}
      />,
    )
    expect(screen.getByRole('treeitem').getAttribute('aria-busy')).toBe('true')
  })

  it('announces a load error and keeps the node retryable', () => {
    render(
      <HoloTree
        nodes={[{ id: 'src', label: 'src', kind: 'branch', error: 'EACCES', expandable: true }]}
        expandedIds={[]}
        onExpandedChange={() => {}}
      />,
    )
    expect(screen.getByRole('alert').textContent).toBe('Failed to load')
    expect(screen.getByRole('treeitem').getAttribute('title')).toBe('EACCES')
  })

  it('reports the node and the raw event on context menu', () => {
    const onContextMenu = vi.fn()
    render(<ControlledTree onContextMenu={onContextMenu} />)
    fireEvent.contextMenu(rowByName('src'))
    expect(onContextMenu).toHaveBeenCalledWith(expect.objectContaining({ id: 'src' }), expect.anything())
  })

  it('colours rows by status without relying on the background', () => {
    render(
      <HoloTree
        nodes={[
          { id: 'a', label: 'a', kind: 'leaf', status: 'added' },
          { id: 'm', label: 'm', kind: 'leaf', status: 'modified' },
          { id: 'd', label: 'd', kind: 'leaf', status: 'deleted' },
          { id: 'c', label: 'c', kind: 'leaf', status: 'conflicted' },
        ]}
        expandedIds={[]}
        onExpandedChange={() => {}}
      />,
    )
    expect(screen.getByText('a').className).toContain('text-status-success')
    expect(screen.getByText('m').className).toContain('text-accent-primary')
    expect(screen.getByText('d').className).toContain('line-through')
    expect(screen.getByText('c').className).toContain('text-status-error')
  })

  it('renders the node badge', () => {
    render(<HoloTree nodes={[{ id: 'a', label: 'a', kind: 'leaf', badge: 7 }]} expandedIds={[]} onExpandedChange={() => {}} />)
    expect(screen.getByText('7')).toBeDefined()
  })
})

describe('HoloTree lazy loading', () => {
  const lazyNodes: HoloTreeNode[] = [{ id: 'src', label: 'src', kind: 'branch', expandable: true }]

  it('requests children once per expansion cycle and reports success', async () => {
    const loadChildren = vi.fn(async () => [{ id: 'src/a.ts', label: 'a.ts', kind: 'leaf' as const, parentId: 'src' }])
    const onChildrenLoaded = vi.fn()
    const onLoadedIdsChange = vi.fn()

    function Host() {
      const [expanded, setExpanded] = useState<string[]>([])
      return (
        <HoloTree
          nodes={lazyNodes}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          loadChildren={loadChildren}
          loadedIds={[]}
          onLoadedIdsChange={onLoadedIdsChange}
          onChildrenLoaded={onChildrenLoaded}
        />
      )
    }
    render(<Host />)
    fireEvent.click(rowByName('src'))
    fireEvent.click(rowByName('src'))
    fireEvent.click(rowByName('src'))
    await waitFor(() => expect(onChildrenLoaded).toHaveBeenCalled())
    expect(loadChildren).toHaveBeenCalledTimes(1)
    expect(onLoadedIdsChange).toHaveBeenCalledWith(['src'])
  })

  it('never re-requests a node already present in loadedIds', () => {
    const loadChildren = vi.fn(async () => [])
    render(
      <HoloTree
        nodes={lazyNodes}
        expandedIds={[]}
        onExpandedChange={() => {}}
        loadChildren={loadChildren}
        loadedIds={['src']}
      />,
    )
    fireEvent.click(rowByName('src'))
    expect(loadChildren).not.toHaveBeenCalled()
  })

  it('reports a failure and leaves the node out of loadedIds so it can retry', async () => {
    const failure = new Error('EACCES')
    const loadChildren = vi.fn(async () => { throw failure })
    const onLoadError = vi.fn()
    const onLoadedIdsChange = vi.fn()

    function Host() {
      const [expanded, setExpanded] = useState<string[]>([])
      return (
        <HoloTree
          nodes={lazyNodes}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          loadChildren={loadChildren}
          loadedIds={[]}
          onLoadedIdsChange={onLoadedIdsChange}
          onLoadError={onLoadError}
        />
      )
    }
    render(<Host />)
    fireEvent.click(rowByName('src'))
    await waitFor(() => expect(onLoadError).toHaveBeenCalledWith(expect.objectContaining({ id: 'src' }), failure))
    expect(onLoadedIdsChange).not.toHaveBeenCalled()

    fireEvent.click(rowByName('src'))
    fireEvent.click(rowByName('src'))
    await waitFor(() => expect(loadChildren).toHaveBeenCalledTimes(2))
  })

  it('shows a switcher for an expandable branch that has no children yet', () => {
    render(
      <HoloTree nodes={lazyNodes} expandedIds={[]} onExpandedChange={() => {}} loadChildren={async () => []} />,
    )
    expect(rowByName('src').getAttribute('aria-expanded')).toBe('false')
  })
})
