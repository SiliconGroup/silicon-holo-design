import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { HoloGitPanel } from './GitPanel'
import type { HoloGitFileChange, HoloGitPanelProps } from '../types'

const changes: HoloGitFileChange[] = [
  { path: 'src/staged.ts', indexState: 'added' },
  { path: 'src/both.ts', indexState: 'modified', worktreeState: 'modified' },
  { path: 'src/dirty.ts', worktreeState: 'modified' },
  { path: 'src/new.ts', worktreeState: 'untracked' },
  { path: 'src/clash.ts', indexState: 'conflicted', worktreeState: 'modified' },
  { path: 'src/gone.ts', worktreeState: 'deleted' },
  { path: 'src/new-name.ts', indexState: 'renamed', originalPath: 'src/old-name.ts' },
]

function setup(overrides: Partial<HoloGitPanelProps> = {}) {
  const props: HoloGitPanelProps = {
    repo: { branch: 'main', upstream: 'origin/main', ahead: 2, behind: 1 },
    changes,
    commitMessage: 'feat: ship studio',
    onCommitMessageChange: vi.fn(),
    onStage: vi.fn(),
    onUnstage: vi.fn(),
    onDiscard: vi.fn(),
    onOpenDiff: vi.fn(),
    onCommit: vi.fn(),
    onRefresh: vi.fn(),
    onSelectChange: vi.fn(),
    ...overrides,
  }
  return { props, ...render(<HoloGitPanel {...props} />) }
}

const gitGroup = (label: string) => screen.getByRole('group', { name: new RegExp(`^${label}`) })
const groupOf = (label: string) => screen.getByRole('group', { name: new RegExp(`^${label}`) })

describe('HoloGitPanel', () => {
  it('announces repository status politely', () => {
    setup()
    const status = screen.getByRole('status')
    expect(status.getAttribute('aria-live')).toBe('polite')
    expect(status.textContent).toContain('main')
    expect(status.textContent).toContain('origin/main')
    expect(status.textContent).toContain('2 ahead')
    expect(status.textContent).toContain('1 behind')
  })

  it('falls back to a no-branch label and flags a detached HEAD', () => {
    setup({ repo: { detached: true } })
    expect(screen.getByText('No branch')).toBeDefined()
    expect(screen.getByText('Detached HEAD')).toBeDefined()
  })

  it('renders only non-empty groups with counts', () => {
    setup()
    expect(groupOf('Merge Conflicts')).toBeDefined()
    expect(groupOf('Staged Changes')).toBeDefined()
    expect(groupOf('Changes')).toBeDefined()
    expect(groupOf('Untracked')).toBeDefined()
    expect(groupOf('Staged Changes').getAttribute('aria-label')).toBe('Staged Changes (3)')
  })

  it('lists a partially staged file in both staged and changes', () => {
    setup()
    expect(groupOf('Staged Changes').textContent).toContain('both.ts')
    expect(groupOf('Changes').textContent).toContain('both.ts')
  })

  it('keeps a conflicted file out of the other groups', () => {
    setup()
    expect(groupOf('Merge Conflicts').textContent).toContain('clash.ts')
    expect(groupOf('Staged Changes').textContent).not.toContain('clash.ts')
    expect(groupOf('Changes').textContent).not.toContain('clash.ts')
  })

  it('shows the rename source alongside the target', () => {
    setup()
    expect(screen.getByText('old-name.ts → new-name.ts')).toBeDefined()
  })

  it('gives every status glyph a readable label', () => {
    setup()
    expect(screen.getAllByLabelText('Added').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Conflicted').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Untracked').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Renamed').length).toBeGreaterThan(0)
  })

  it('stages and unstages single files with the right paths', () => {
    const { props } = setup()
    fireEvent.click(within(groupOf('Changes')).getAllByRole('button', { name: 'Stage changes' })[0])
    expect(props.onStage).toHaveBeenCalledWith(['src/both.ts'])
    fireEvent.click(within(groupOf('Staged Changes')).getAllByRole('button', { name: 'Unstage changes' })[0])
    expect(props.onUnstage).toHaveBeenCalledWith(['src/staged.ts'])
  })

  it('supports bulk staging and unstaging per group', () => {
    const { props } = setup()
    fireEvent.click(within(groupOf('Changes')).getByRole('button', { name: 'Stage all' }))
    expect(props.onStage).toHaveBeenCalledWith(['src/both.ts', 'src/dirty.ts', 'src/gone.ts'])
    fireEvent.click(within(groupOf('Untracked')).getByRole('button', { name: 'Stage all' }))
    expect(props.onStage).toHaveBeenLastCalledWith(['src/new.ts'])
    fireEvent.click(within(groupOf('Staged Changes')).getByRole('button', { name: 'Unstage all' }))
    expect(props.onUnstage).toHaveBeenCalledWith(['src/staged.ts', 'src/both.ts', 'src/new-name.ts'])
  })

  it('opens the diff with the side of the owning group', () => {
    const { props } = setup()
    fireEvent.click(within(groupOf('Staged Changes')).getAllByRole('button', { name: 'Open changes' })[0])
    expect(props.onOpenDiff).toHaveBeenCalledWith('src/staged.ts', 'index')
    fireEvent.click(within(groupOf('Changes')).getAllByRole('button', { name: 'Open changes' })[0])
    expect(props.onOpenDiff).toHaveBeenCalledWith('src/both.ts', 'worktree')
  })

  it('marks a conflict resolved through stage and never offers discard for it', () => {
    const { props } = setup()
    const conflicts = within(groupOf('Merge Conflicts'))
    expect(conflicts.queryByRole('button', { name: 'Discard changes' })).toBeNull()
    fireEvent.click(conflicts.getByRole('button', { name: 'Mark as resolved' }))
    expect(props.onStage).toHaveBeenCalledWith(['src/clash.ts'])
  })

  it('requires confirmation before discarding and reports the file count', () => {
    const { props } = setup()
    fireEvent.click(within(groupOf('Changes')).getAllByRole('button', { name: 'Discard changes' })[0])
    expect(props.onDiscard).not.toHaveBeenCalled()
    expect(screen.getByText('Discard changes in 1 file(s)? This cannot be undone.')).toBeDefined()
    const discardButtons = screen.getAllByRole('button', { name: 'Discard changes' })
    fireEvent.click(discardButtons[discardButtons.length - 1])
    expect(props.onDiscard).toHaveBeenCalledWith(['src/both.ts'])
  })

  it('can cancel the discard confirmation without side effects', () => {
    const { props } = setup()
    fireEvent.click(within(groupOf('Changes')).getAllByRole('button', { name: 'Discard changes' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(props.onDiscard).not.toHaveBeenCalled()
  })

  it('reports the selected change', () => {
    const { props } = setup()
    fireEvent.click(screen.getByRole('button', { name: /dirty\.ts/ }))
    expect(props.onSelectChange).toHaveBeenCalledWith(expect.objectContaining({ path: 'src/dirty.ts' }))
  })

  it('commits with the amend flag from the checkbox', () => {
    const { props } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Commit' }))
    expect(props.onCommit).toHaveBeenCalledWith({ amend: false })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Commit' }))
    expect(props.onCommit).toHaveBeenLastCalledWith({ amend: true })
  })

  it('commits on the platform shortcut inside the message field', () => {
    const { props } = setup()
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Commit message' }), { key: 'Enter', metaKey: true })
    expect(props.onCommit).toHaveBeenCalledWith({ amend: false })
  })

  it('never clears the controlled commit message itself', () => {
    const { props } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Commit' }))
    expect(props.onCommitMessageChange).not.toHaveBeenCalled()
  })

  it('blocks the commit without a message and explains why', () => {
    const { props } = setup({ commitMessage: '   ' })
    const commit = screen.getByRole('button', { name: 'Commit' })
    expect(commit.hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('note').textContent).toBe('Enter a commit message first')
    fireEvent.click(commit)
    expect(props.onCommit).not.toHaveBeenCalled()
  })

  it('blocks the commit with an empty index unless allowed or amending', () => {
    const worktreeOnly: HoloGitFileChange[] = [{ path: 'a.ts', worktreeState: 'modified' }]
    const { unmount } = setup({ changes: worktreeOnly })
    expect(screen.getByRole('note').textContent).toBe('Stage at least one change first')
    unmount()
    setup({ changes: worktreeOnly, allowEmptyCommit: true })
    expect(screen.queryByRole('note')).toBeNull()
  })

  it('blocks the commit while a git operation is in progress', () => {
    setup({ repo: { branch: 'main', inProgress: 'rebase' } })
    expect(screen.getByText('Rebase in progress')).toBeDefined()
    expect(screen.getByRole('note').textContent).toBe('Finish the in-progress git operation first')
    expect(screen.getByRole('button', { name: 'Commit' }).hasAttribute('disabled')).toBe(true)
  })

  it('disables interaction and shows progress while busy', () => {
    setup({ busy: true })
    expect(screen.getByRole('button', { name: 'Commit' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('textbox', { name: 'Commit message' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getAllByRole('button', { name: 'Refresh' })[0].hasAttribute('disabled')).toBe(true)
  })

  it('surfaces an error banner', () => {
    setup({ error: 'index.lock exists' })
    expect(screen.getByText('index.lock exists')).toBeDefined()
  })

  it('refreshes on demand', () => {
    const { props } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(props.onRefresh).toHaveBeenCalled()
  })

  it('collapses and expands a group', () => {
    setup()
    const header = within(groupOf('Untracked')).getByRole('button', { name: /Untracked/ })
    expect(header.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(header)
    expect(header.getAttribute('aria-expanded')).toBe('false')
    expect(groupOf('Untracked').textContent).not.toContain('new.ts')
  })

  it('renders the empty state and honours custom empty content', () => {
    const { unmount } = setup({ changes: [] })
    expect(screen.getByText('No changes')).toBeDefined()
    unmount()
    setup({ changes: [], emptyContent: <p>Clean tree</p> })
    expect(screen.getByText('Clean tree')).toBeDefined()
  })

  it('keeps row actions reachable by keyboard focus, not only hover', () => {
    setup()
    const actions = within(gitGroup('Changes')).getAllByRole('button', { name: 'Open changes' })[0]
    const container = actions.closest('span')
    expect(container?.className).toContain('group-hover:flex')
    expect(container?.className).toContain('group-focus-within:flex')
  })

  it('omits actions whose callbacks are not supplied', () => {
    setup({ onStage: undefined, onUnstage: undefined, onDiscard: undefined, onOpenDiff: undefined, onRefresh: undefined })
    expect(screen.queryAllByRole('button', { name: 'Stage all' })).toHaveLength(0)
    expect(screen.queryAllByRole('button', { name: 'Unstage all' })).toHaveLength(0)
    expect(screen.queryAllByRole('button', { name: 'Open changes' })).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull()
  })
})
