import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createExplorerPanel } from './create-explorer-panel'
import { createGitPanel } from './create-git-panel'
import type { HoloGitPanelProps, HoloStudioPanel, HoloTreeProps } from '../types'

const tree: HoloTreeProps = {
  nodes: [{ id: 'src', label: 'src', kind: 'branch' }],
  expandedIds: [],
  onExpandedChange: () => {},
}

const git: HoloGitPanelProps = {
  repo: { branch: 'main' },
  changes: [{ path: 'a.ts', worktreeState: 'modified' }, { path: 'b.ts', indexState: 'added' }],
  commitMessage: '',
  onCommitMessageChange: () => {},
}

/** 类型层断言：工厂产出与手写描述符完全同构。 */
const structural: HoloStudioPanel = createExplorerPanel({ tree })

describe('createExplorerPanel', () => {
  it('produces a panel descriptor with sensible defaults', () => {
    const panel = createExplorerPanel({ tree })
    expect(panel.id).toBe('explorer')
    expect(panel.title).toBe('Explorer')
    expect(panel.icon).toBeDefined()
    expect(typeof panel.render).toBe('function')
    expect('badge' in panel).toBe(false)
    expect('placement' in panel).toBe(false)
    expect(structural.id).toBe('explorer')
  })

  it('renders the tree only when render is called', () => {
    const panel = createExplorerPanel({ tree })
    render(<>{panel.render()}</>)
    expect(screen.getByRole('tree')).toBeDefined()
    expect(screen.getByRole('treeitem', { name: /src/ })).toBeDefined()
  })

  it('forwards every optional descriptor field', () => {
    const actions = <button type="button">act</button>
    const panel = createExplorerPanel({ tree, id: 'files', title: '资源管理', icon: <span>I</span>, badge: '!', actions, placement: 'bottom', disabled: true })
    expect(panel.id).toBe('files')
    expect(panel.title).toBe('资源管理')
    expect(panel.badge).toBe('!')
    expect(panel.actions).toBe(actions)
    expect(panel.placement).toBe('bottom')
    expect(panel.disabled).toBe(true)
  })

  it('passes tree props straight through', () => {
    const onExpandedChange = vi.fn()
    const panel = createExplorerPanel({ tree: { ...tree, ariaLabel: 'Files', onExpandedChange } })
    render(<>{panel.render()}</>)
    expect(screen.getByRole('tree', { name: 'Files' })).toBeDefined()
  })
})

describe('createGitPanel', () => {
  it('produces a panel descriptor with sensible defaults', () => {
    const panel = createGitPanel({ git })
    expect(panel.id).toBe('git')
    expect(panel.title).toBe('Source Control')
    expect(typeof panel.render).toBe('function')
  })

  it('derives the badge from the change count', () => {
    expect(createGitPanel({ git }).badge).toBe(2)
    expect('badge' in createGitPanel({ git: { ...git, changes: [] } })).toBe(false)
  })

  it('accepts an explicit badge and can switch it off', () => {
    expect(createGitPanel({ git, badge: '9+' }).badge).toBe('9+')
    expect('badge' in createGitPanel({ git, badge: null })).toBe(false)
  })

  it('renders the git panel only when render is called', () => {
    const panel = createGitPanel({ git })
    render(<>{panel.render()}</>)
    expect(screen.getByRole('status', { name: 'Repository status' })).toBeDefined()
    expect(screen.getByRole('group', { name: 'Changes (1)' })).toBeDefined()
    expect(screen.getByRole('group', { name: 'Staged Changes (1)' })).toBeDefined()
  })

  it('forwards every optional descriptor field', () => {
    const panel = createGitPanel({ git, id: 'scm', title: '源代码管理', icon: <span>G</span>, placement: 'bottom', disabled: true })
    expect(panel.id).toBe('scm')
    expect(panel.title).toBe('源代码管理')
    expect(panel.placement).toBe('bottom')
    expect(panel.disabled).toBe(true)
  })
})
