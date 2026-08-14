import { describe, expect, it } from 'vitest'
import { buildVisibleRows, computeWindow, findTypeaheadIndex, isExpandable, resolveKeyboardTarget, resolveRangeSelection } from './tree-model'
import type { HoloTreeNode } from '../types'

const branch = (id: string, parentId?: string): HoloTreeNode => ({ id, label: id, kind: 'branch', ...(parentId ? { parentId } : {}) })
const leaf = (id: string, parentId?: string): HoloTreeNode => ({ id, label: id, kind: 'leaf', ...(parentId ? { parentId } : {}) })

const nodes: HoloTreeNode[] = [
  branch('src'),
  leaf('src/a.ts', 'src'),
  branch('src/deep', 'src'),
  leaf('src/deep/b.ts', 'src/deep'),
  leaf('README.md'),
]

describe('buildVisibleRows', () => {
  it('shows only roots when nothing is expanded', () => {
    expect(buildVisibleRows(nodes, []).map(row => row.node.id)).toEqual(['src', 'README.md'])
  })

  it('expands one level at a time and reports depth', () => {
    const rows = buildVisibleRows(nodes, ['src'])
    expect(rows.map(row => row.node.id)).toEqual(['src', 'src/a.ts', 'src/deep', 'README.md'])
    expect(rows.map(row => row.depth)).toEqual([0, 1, 1, 0])
  })

  it('expands nested branches', () => {
    const rows = buildVisibleRows(nodes, ['src', 'src/deep'])
    expect(rows.map(row => row.node.id)).toEqual(['src', 'src/a.ts', 'src/deep', 'src/deep/b.ts', 'README.md'])
    expect(rows[3].depth).toBe(2)
  })

  it('reports hasChildren from known nodes only', () => {
    const rows = buildVisibleRows(nodes, ['src'])
    expect(rows[0].hasChildren).toBe(true)
    expect(rows[2].hasChildren).toBe(true)
    expect(rows[1].hasChildren).toBe(false)
  })

  it('ignores expanded ids for leaves', () => {
    expect(buildVisibleRows(nodes, ['README.md']).map(row => row.node.id)).toEqual(['src', 'README.md'])
  })

  it('treats orphan parentId as a root so partial loads stay visible', () => {
    const rows = buildVisibleRows([leaf('lost', 'missing-parent')], [])
    expect(rows.map(row => row.node.id)).toEqual(['lost'])
    expect(rows[0].depth).toBe(0)
  })

  it('does not loop on cyclic parent references', () => {
    const cyclic: HoloTreeNode[] = [
      { id: 'a', label: 'a', kind: 'branch', parentId: 'b' },
      { id: 'b', label: 'b', kind: 'branch', parentId: 'a' },
    ]
    expect(buildVisibleRows(cyclic, ['a', 'b'])).toEqual([])
  })

  it('accepts a Set as the expanded collection', () => {
    expect(buildVisibleRows(nodes, new Set(['src'])).map(row => row.node.id)).toEqual(['src', 'src/a.ts', 'src/deep', 'README.md'])
  })

  it('returns an empty array for no nodes', () => {
    expect(buildVisibleRows([], ['src'])).toEqual([])
  })
})

describe('computeWindow', () => {
  it('returns an empty window with no rows', () => {
    expect(computeWindow(0, 200, 24, 0)).toEqual({ start: 0, end: 0, paddingTop: 0, paddingBottom: 0 })
  })

  it('starts at zero and pads the tail at the top of the list', () => {
    const view = computeWindow(0, 240, 24, 1000, 4)
    expect(view.start).toBe(0)
    expect(view.paddingTop).toBe(0)
    expect(view.end).toBe(19)
    expect(view.paddingBottom).toBe((1000 - 19) * 24)
  })

  it('clamps the end to the row count', () => {
    const view = computeWindow(24 * 990, 240, 24, 1000, 4)
    expect(view.end).toBe(1000)
    expect(view.paddingBottom).toBe(0)
    expect(view.paddingTop).toBe(view.start * 24)
  })

  it('renders everything when the list is shorter than the viewport', () => {
    const view = computeWindow(0, 600, 24, 5)
    expect(view).toEqual({ start: 0, end: 5, paddingTop: 0, paddingBottom: 0 })
  })

  it('ignores negative scroll offsets from elastic scrolling', () => {
    expect(computeWindow(-120, 240, 24, 100).start).toBe(0)
  })

  it('guards against a zero row height', () => {
    expect(computeWindow(0, 240, 0, 100)).toEqual({ start: 0, end: 0, paddingTop: 0, paddingBottom: 0 })
  })
})

describe('resolveKeyboardTarget', () => {
  const rows = buildVisibleRows(nodes, ['src', 'src/deep'])

  it('moves down and up within bounds', () => {
    expect(resolveKeyboardTarget(rows, 0, 'ArrowDown', ['src', 'src/deep'])).toEqual({ type: 'move', index: 1 })
    expect(resolveKeyboardTarget(rows, 0, 'ArrowUp', ['src', 'src/deep'])).toEqual({ type: 'move', index: 0 })
    expect(resolveKeyboardTarget(rows, rows.length - 1, 'ArrowDown', ['src'])).toEqual({ type: 'move', index: rows.length - 1 })
  })

  it('jumps to the first and last row', () => {
    expect(resolveKeyboardTarget(rows, 2, 'Home', [])).toEqual({ type: 'move', index: 0 })
    expect(resolveKeyboardTarget(rows, 0, 'End', [])).toEqual({ type: 'move', index: rows.length - 1 })
  })

  it('expands a collapsed branch with ArrowRight', () => {
    const collapsed = buildVisibleRows(nodes, [])
    expect(resolveKeyboardTarget(collapsed, 0, 'ArrowRight', [])).toEqual({ type: 'expand', id: 'src' })
  })

  it('steps into the first child when the branch is already expanded', () => {
    expect(resolveKeyboardTarget(rows, 0, 'ArrowRight', ['src', 'src/deep'])).toEqual({ type: 'move', index: 1 })
  })

  it('does nothing on ArrowRight for a leaf', () => {
    expect(resolveKeyboardTarget(rows, 1, 'ArrowRight', ['src'])).toEqual({ type: 'none' })
  })

  it('collapses an expanded branch with ArrowLeft', () => {
    expect(resolveKeyboardTarget(rows, 0, 'ArrowLeft', ['src'])).toEqual({ type: 'collapse', id: 'src' })
  })

  it('moves to the parent with ArrowLeft when already collapsed', () => {
    expect(resolveKeyboardTarget(rows, 1, 'ArrowLeft', ['src', 'src/deep'])).toEqual({ type: 'move', index: 0 })
  })

  it('does nothing on ArrowLeft at the root level', () => {
    expect(resolveKeyboardTarget(rows, 4, 'ArrowLeft', ['src', 'src/deep'])).toEqual({ type: 'none' })
  })

  it('ignores unrelated keys and empty rows', () => {
    expect(resolveKeyboardTarget(rows, 0, 'PageDown', [])).toEqual({ type: 'none' })
    expect(resolveKeyboardTarget([], 0, 'ArrowDown', [])).toEqual({ type: 'none' })
  })

  it('normalises an out-of-range index', () => {
    expect(resolveKeyboardTarget(rows, -5, 'ArrowDown', [])).toEqual({ type: 'move', index: 1 })
    expect(resolveKeyboardTarget(rows, 99, 'ArrowUp', [])).toEqual({ type: 'move', index: 0 })
  })
})

describe('findTypeaheadIndex', () => {
  const rows = buildVisibleRows(nodes, ['src'])

  it('finds the next match after the cursor and wraps around', () => {
    expect(findTypeaheadIndex(rows, 'r', 0)).toBe(3)
    expect(findTypeaheadIndex(rows, 's', 3)).toBe(0)
  })

  it('is case insensitive', () => {
    expect(findTypeaheadIndex(rows, 'README', 0)).toBe(3)
  })

  it('returns -1 when nothing matches', () => {
    expect(findTypeaheadIndex(rows, 'zzz', 0)).toBe(-1)
    expect(findTypeaheadIndex(rows, '', 0)).toBe(-1)
    expect(findTypeaheadIndex([], 'a', 0)).toBe(-1)
  })
})

describe('resolveRangeSelection', () => {
  const rows = buildVisibleRows(nodes, ['src', 'src/deep'])

  it('selects the inclusive visible range in either direction', () => {
    expect(resolveRangeSelection(rows, 'src', 'src/deep')).toEqual(['src', 'src/a.ts', 'src/deep'])
    expect(resolveRangeSelection(rows, 'src/deep', 'src')).toEqual(['src', 'src/a.ts', 'src/deep'])
  })

  it('falls back to a single selection without a usable anchor', () => {
    expect(resolveRangeSelection(rows, undefined, 'src/a.ts')).toEqual(['src/a.ts'])
    expect(resolveRangeSelection(rows, 'not-visible', 'src/a.ts')).toEqual(['src/a.ts'])
  })

  it('returns nothing when the target is not visible', () => {
    expect(resolveRangeSelection(rows, 'src', 'hidden')).toEqual([])
  })
})

describe('isExpandable', () => {
  const [rootRow] = buildVisibleRows([branch('src')], [])

  it('honours an explicit expandable flag', () => {
    expect(isExpandable({ ...rootRow, node: { ...rootRow.node, expandable: true } }, false)).toBe(true)
    expect(isExpandable({ ...rootRow, node: { ...rootRow.node, expandable: false } }, true)).toBe(false)
  })

  it('infers from known children or a loader', () => {
    expect(isExpandable(rootRow, false)).toBe(false)
    expect(isExpandable(rootRow, true)).toBe(true)
    expect(isExpandable({ ...rootRow, hasChildren: true }, false)).toBe(true)
  })

  it('never marks a leaf expandable', () => {
    const [leafRow] = buildVisibleRows([leaf('a.ts')], [])
    expect(isExpandable(leafRow, true)).toBe(false)
  })
})
