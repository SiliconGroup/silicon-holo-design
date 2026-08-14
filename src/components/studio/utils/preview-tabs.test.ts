import { describe, expect, it } from 'vitest'
import { closeTab, openTab, pinTab, type HoloFileTabsState } from './preview-tabs'

const tab = (id: string) => ({ id, label: id })
const ids = (state: HoloFileTabsState) => state.tabs.map(candidate => candidate.id)
const previews = (state: HoloFileTabsState) => state.tabs.filter(candidate => candidate.preview === true).map(candidate => candidate.id)

const empty: HoloFileTabsState = { tabs: [] }

describe('openTab', () => {
  it('opens the first file as a preview tab', () => {
    const state = openTab(empty, tab('a.ts'))
    expect(ids(state)).toEqual(['a.ts'])
    expect(previews(state)).toEqual(['a.ts'])
    expect(state.activeId).toBe('a.ts')
  })

  it('replaces the preview tab in place instead of opening a new one', () => {
    let state = openTab(empty, tab('a.ts'))
    state = openTab(state, tab('b.ts'))
    expect(ids(state)).toEqual(['b.ts'])
    expect(previews(state)).toEqual(['b.ts'])
    expect(state.activeId).toBe('b.ts')
  })

  it('keeps at most one preview tab across many single clicks', () => {
    let state = empty
    for (const id of ['a.ts', 'b.ts', 'c.ts', 'd.ts']) state = openTab(state, tab(id))
    expect(ids(state)).toEqual(['d.ts'])
    expect(previews(state)).toHaveLength(1)
  })

  it('opens pinned when asked, leaving room for a new preview tab', () => {
    let state = openTab(empty, tab('a.ts'), { pinned: true })
    expect(previews(state)).toEqual([])
    state = openTab(state, tab('b.ts'))
    expect(ids(state)).toEqual(['a.ts', 'b.ts'])
    expect(previews(state)).toEqual(['b.ts'])
  })

  it('replaces the preview tab in place, preserving its position among pinned tabs', () => {
    let state = openTab(empty, tab('pinned-1'), { pinned: true })
    state = openTab(state, tab('preview'))
    state = openTab(state, tab('pinned-2'), { pinned: true })
    expect(ids(state)).toEqual(['pinned-1', 'preview', 'pinned-2'])
    state = openTab(state, tab('other'))
    // 预览位保持在原来的下标上，不会跑到末尾
    expect(ids(state)).toEqual(['pinned-1', 'other', 'pinned-2'])
    expect(previews(state)).toEqual(['other'])
  })

  it('replaces the preview tab even while a pinned tab is active', () => {
    let state = openTab(empty, tab('kept'), { pinned: true })
    state = openTab(state, tab('preview'))
    state = { ...state, activeId: 'kept' }
    state = openTab(state, tab('next'))
    // 这是用户描述的场景：停在固定标签上单击新文件，替换的仍是那个已存在的预览标签
    expect(ids(state)).toEqual(['kept', 'next'])
    expect(previews(state)).toEqual(['next'])
    expect(state.activeId).toBe('next')
  })

  it('only activates an already open tab and never downgrades a pinned tab', () => {
    let state = openTab(empty, tab('a.ts'), { pinned: true })
    state = openTab(state, tab('b.ts'))
    state = openTab(state, tab('a.ts'))
    expect(state.activeId).toBe('a.ts')
    expect(previews(state)).toEqual(['b.ts'])
    expect(ids(state)).toEqual(['a.ts', 'b.ts'])
  })

  it('pins an already open preview tab when opened with the pinned gesture', () => {
    let state = openTab(empty, tab('a.ts'))
    state = openTab(state, tab('a.ts'), { pinned: true })
    expect(previews(state)).toEqual([])
    expect(ids(state)).toEqual(['a.ts'])
  })

  it('carries every field of the supplied tab', () => {
    const state = openTab(empty, { id: 'a.ts', label: 'a.ts', title: 'src/a.ts', dirty: true })
    expect(state.tabs[0].title).toBe('src/a.ts')
    expect(state.tabs[0].dirty).toBe(true)
  })
})

describe('pinTab', () => {
  it('turns a preview tab into a permanent one', () => {
    let state = openTab(empty, tab('a.ts'))
    state = pinTab(state, 'a.ts')
    expect(previews(state)).toEqual([])
    // 固定之后单击新文件会新开一个预览标签，而不是替换它
    state = openTab(state, tab('b.ts'))
    expect(ids(state)).toEqual(['a.ts', 'b.ts'])
  })

  it('returns the same state for an unknown or already pinned tab', () => {
    const state = openTab(empty, tab('a.ts'), { pinned: true })
    expect(pinTab(state, 'a.ts')).toBe(state)
    expect(pinTab(state, 'missing')).toBe(state)
  })
})

describe('closeTab', () => {
  it('removes the tab and keeps the active id when another tab was active', () => {
    let state = openTab(empty, tab('a.ts'), { pinned: true })
    state = openTab(state, tab('b.ts'), { pinned: true })
    state = { ...state, activeId: 'a.ts' }
    const next = closeTab(state, 'b.ts')
    expect(ids(next)).toEqual(['a.ts'])
    expect(next.activeId).toBe('a.ts')
  })

  it('moves activation to the right neighbour, then the left one', () => {
    let state = empty
    for (const id of ['a', 'b', 'c']) state = openTab(state, tab(id), { pinned: true })
    state = { ...state, activeId: 'b' }
    const afterMiddle = closeTab(state, 'b')
    expect(afterMiddle.activeId).toBe('c')
    const afterLast = closeTab({ ...afterMiddle, activeId: 'c' }, 'c')
    expect(afterLast.activeId).toBe('a')
  })

  it('clears the active id when the last tab closes', () => {
    const state = openTab(empty, tab('a.ts'))
    const next = closeTab(state, 'a.ts')
    expect(next.tabs).toEqual([])
    expect(next.activeId).toBeUndefined()
  })

  it('returns the same state for an unknown tab', () => {
    const state = openTab(empty, tab('a.ts'))
    expect(closeTab(state, 'missing')).toBe(state)
  })
})
