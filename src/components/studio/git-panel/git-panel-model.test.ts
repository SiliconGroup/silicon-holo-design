import { describe, expect, it } from 'vitest'
import enUS from '@/locale/en-US'
import { gitGroupLabel, gitInProgressLabel, gitStateBadge, gitStateLabel, groupGitChanges, resolveCommitAvailability, splitChangePath } from './git-panel-model'
import type { HoloGitFileChange } from '../types'
import type { StudioLocale } from '../utils/use-studio-locale'

const locale = enUS.studio as StudioLocale
const entries = (changes: HoloGitFileChange[], id: string) => groupGitChanges(changes).find(group => group.id === id)!.entries

describe('groupGitChanges', () => {
  it('always returns the four groups in display order', () => {
    expect(groupGitChanges([]).map(group => group.id)).toEqual(['conflicts', 'staged', 'changes', 'untracked'])
  })

  it('routes staged-only changes to the staged group', () => {
    const changes: HoloGitFileChange[] = [{ path: 'a.ts', indexState: 'modified' }]
    expect(entries(changes, 'staged').map(entry => entry.change.path)).toEqual(['a.ts'])
    expect(entries(changes, 'changes')).toHaveLength(0)
  })

  it('routes worktree-only changes to the changes group', () => {
    const changes: HoloGitFileChange[] = [{ path: 'a.ts', worktreeState: 'modified' }]
    expect(entries(changes, 'changes').map(entry => entry.change.path)).toEqual(['a.ts'])
    expect(entries(changes, 'staged')).toHaveLength(0)
  })

  it('places a partially staged file in both staged and changes', () => {
    const changes: HoloGitFileChange[] = [{ path: 'a.ts', indexState: 'added', worktreeState: 'modified' }]
    expect(entries(changes, 'staged')).toEqual([{ change: changes[0], state: 'added' }])
    expect(entries(changes, 'changes')).toEqual([{ change: changes[0], state: 'modified' }])
  })

  it('separates untracked files from ordinary worktree changes', () => {
    const changes: HoloGitFileChange[] = [{ path: 'new.ts', worktreeState: 'untracked' }]
    expect(entries(changes, 'untracked').map(entry => entry.change.path)).toEqual(['new.ts'])
    expect(entries(changes, 'changes')).toHaveLength(0)
  })

  it('gives conflicts priority and excludes them everywhere else', () => {
    const changes: HoloGitFileChange[] = [{ path: 'a.ts', indexState: 'conflicted', worktreeState: 'modified' }]
    expect(entries(changes, 'conflicts')).toEqual([{ change: changes[0], state: 'conflicted' }])
    expect(entries(changes, 'staged')).toHaveLength(0)
    expect(entries(changes, 'changes')).toHaveLength(0)
  })

  it('detects a conflict declared only on the worktree side', () => {
    expect(entries([{ path: 'a.ts', worktreeState: 'conflicted' }], 'conflicts')).toHaveLength(1)
  })

  it('drops entries with neither side set', () => {
    const groups = groupGitChanges([{ path: 'a.ts' }])
    expect(groups.every(group => group.entries.length === 0)).toBe(true)
  })

  it('exposes the git side each group acts on', () => {
    const sides = Object.fromEntries(groupGitChanges([]).map(group => [group.id, group.side]))
    expect(sides).toEqual({ conflicts: 'worktree', staged: 'index', changes: 'worktree', untracked: 'worktree' })
  })

  it('preserves input order inside a group', () => {
    const changes: HoloGitFileChange[] = [
      { path: 'b.ts', worktreeState: 'modified' },
      { path: 'a.ts', worktreeState: 'modified' },
    ]
    expect(entries(changes, 'changes').map(entry => entry.change.path)).toEqual(['b.ts', 'a.ts'])
  })
})

describe('git status labels', () => {
  it('maps every state to a porcelain-style badge', () => {
    expect(gitStateBadge('modified')).toBe('M')
    expect(gitStateBadge('added')).toBe('A')
    expect(gitStateBadge('deleted')).toBe('D')
    expect(gitStateBadge('renamed')).toBe('R')
    expect(gitStateBadge('copied')).toBe('C')
    expect(gitStateBadge('typeChanged')).toBe('T')
    expect(gitStateBadge('untracked')).toBe('?')
    expect(gitStateBadge('ignored')).toBe('!')
    expect(gitStateBadge('conflicted')).toBe('U')
  })

  it('gives every state a readable name so colour is never the only signal', () => {
    for (const state of ['modified', 'added', 'deleted', 'renamed', 'copied', 'typeChanged', 'untracked', 'ignored', 'conflicted'] as const) {
      expect(gitStateLabel(state, locale).length, state).toBeGreaterThan(0)
    }
  })

  it('labels every group and in-progress operation', () => {
    for (const id of ['conflicts', 'staged', 'changes', 'untracked'] as const) {
      expect(gitGroupLabel(id, locale).length, id).toBeGreaterThan(0)
    }
    for (const operation of ['merge', 'rebase', 'cherry-pick', 'revert', 'bisect'] as const) {
      expect(gitInProgressLabel(operation, locale).length, operation).toBeGreaterThan(0)
    }
  })
})

describe('resolveCommitAvailability', () => {
  const staged: HoloGitFileChange[] = [{ path: 'a.ts', indexState: 'modified' }]
  const base = { commitMessage: 'feat: ship', changes: staged, repo: {}, amend: false }

  it('allows a commit with a message and staged content', () => {
    expect(resolveCommitAvailability(base)).toEqual({ canCommit: true })
  })

  it('blocks a blank or whitespace-only message', () => {
    expect(resolveCommitAvailability({ ...base, commitMessage: '' })).toEqual({ canCommit: false, reason: 'message' })
    expect(resolveCommitAvailability({ ...base, commitMessage: '   \n' })).toEqual({ canCommit: false, reason: 'message' })
  })

  it('blocks an empty index unless amending or explicitly allowed', () => {
    const empty = { ...base, changes: [{ path: 'a.ts', worktreeState: 'modified' }] as HoloGitFileChange[] }
    expect(resolveCommitAvailability(empty)).toEqual({ canCommit: false, reason: 'staged' })
    expect(resolveCommitAvailability({ ...empty, amend: true })).toEqual({ canCommit: true })
    expect(resolveCommitAvailability({ ...empty, allowEmptyCommit: true })).toEqual({ canCommit: true })
  })

  it('does not count a conflicted index entry as staged content', () => {
    const conflicted = { ...base, changes: [{ path: 'a.ts', indexState: 'conflicted' }] as HoloGitFileChange[] }
    expect(resolveCommitAvailability(conflicted)).toEqual({ canCommit: false, reason: 'staged' })
  })

  it('blocks any in-progress git operation before other reasons', () => {
    expect(resolveCommitAvailability({ ...base, repo: { inProgress: 'rebase' } })).toEqual({ canCommit: false, reason: 'operation' })
    expect(resolveCommitAvailability({ ...base, commitMessage: '', repo: { inProgress: 'merge' } })).toEqual({ canCommit: false, reason: 'operation' })
  })

  it('blocks while busy without inventing a reason', () => {
    expect(resolveCommitAvailability({ ...base, busy: true })).toEqual({ canCommit: false })
  })
})

describe('splitChangePath', () => {
  it('splits a nested path', () => {
    expect(splitChangePath('src/components/App.tsx')).toEqual({ directory: 'src/components', fileName: 'App.tsx' })
  })

  it('handles a root-level path', () => {
    expect(splitChangePath('README.md')).toEqual({ directory: '', fileName: 'README.md' })
  })

  it('normalises Windows separators', () => {
    expect(splitChangePath('src\\lib\\a.ts')).toEqual({ directory: 'src/lib', fileName: 'a.ts' })
  })
})
