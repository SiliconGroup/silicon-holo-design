import { describe, expect, it } from 'vitest'
import { flattenTree } from './flatten-tree'
import type { HoloNestedTreeNode } from '../types'

const leaf = (id: string, label = id): HoloNestedTreeNode => ({ id, label, kind: 'leaf' })

describe('flattenTree', () => {
  it('returns an empty array for empty input', () => {
    expect(flattenTree([])).toEqual([])
  })

  it('omits parentId for roots and keeps depth-first order', () => {
    const rows = flattenTree([
      { id: 'src', label: 'src', kind: 'branch', children: [leaf('src/a.ts'), leaf('src/b.ts')] },
      leaf('README.md'),
    ])
    expect(rows.map(row => row.id)).toEqual(['src', 'src/a.ts', 'src/b.ts', 'README.md'])
    expect('parentId' in rows[0]).toBe(false)
    expect(rows[1].parentId).toBe('src')
    expect('parentId' in rows[3]).toBe(false)
  })

  it('flattens deeply nested branches', () => {
    const rows = flattenTree([
      {
        id: 'a', label: 'a', kind: 'branch',
        children: [{ id: 'a/b', label: 'b', kind: 'branch', children: [{ id: 'a/b/c', label: 'c', kind: 'branch', children: [leaf('a/b/c/d.ts')] }] }],
      },
    ])
    expect(rows.map(row => row.parentId)).toEqual([undefined, 'a', 'a/b', 'a/b/c'])
  })

  it('treats a branch without children as a leaf-shaped row and drops the children key', () => {
    const rows = flattenTree([{ id: 'empty', label: 'empty', kind: 'branch', children: [] }])
    expect(rows).toHaveLength(1)
    expect('children' in rows[0]).toBe(false)
  })

  it('preserves every other node field', () => {
    const rows = flattenTree([{ id: 'x', label: 'x', kind: 'leaf', status: 'modified', badge: 3, disabled: true, meta: { path: '/x' } }])
    expect(rows[0].status).toBe('modified')
    expect(rows[0].badge).toBe(3)
    expect(rows[0].disabled).toBe(true)
    expect(rows[0].meta).toEqual({ path: '/x' })
  })
})
