import type { HoloGitFileChange, HoloGitFileState, HoloGitRepoState } from '../types'
import type { StudioLocale } from '../utils/use-studio-locale'

export type HoloGitGroupId = 'conflicts' | 'staged' | 'changes' | 'untracked'

export interface HoloGitGroup {
  id: HoloGitGroupId
  /** 该分组条目对应的 git 侧，决定 diff 与暂存方向。 */
  side: 'index' | 'worktree'
  entries: HoloGitGroupEntry[]
}

export interface HoloGitGroupEntry {
  change: HoloGitFileChange
  /** 该条目在此分组中呈现的状态。 */
  state: HoloGitFileState
}

/**
 * 按 git 语义分组。要点：
 * - 冲突优先，冲突文件不出现在其他分组。
 * - 非冲突文件的 indexState 与 worktreeState 可同时非空，
 *   此时它会**同时**出现在 Staged 与 Changes 两组 —— 与 VS Code 行为一致，这是正确的。
 */
export function groupGitChanges(changes: HoloGitFileChange[]): HoloGitGroup[] {
  const conflicts: HoloGitGroupEntry[] = []
  const staged: HoloGitGroupEntry[] = []
  const unstaged: HoloGitGroupEntry[] = []
  const untracked: HoloGitGroupEntry[] = []

  for (const change of changes) {
    if (change.indexState === 'conflicted' || change.worktreeState === 'conflicted') {
      conflicts.push({ change, state: 'conflicted' })
      continue
    }
    if (change.indexState) staged.push({ change, state: change.indexState })
    if (change.worktreeState === 'untracked') untracked.push({ change, state: 'untracked' })
    else if (change.worktreeState) unstaged.push({ change, state: change.worktreeState })
  }

  return [
    { id: 'conflicts', side: 'worktree', entries: conflicts },
    { id: 'staged', side: 'index', entries: staged },
    { id: 'changes', side: 'worktree', entries: unstaged },
    { id: 'untracked', side: 'worktree', entries: untracked },
  ]
}

const stateBadges: Record<HoloGitFileState, string> = {
  modified: 'M',
  added: 'A',
  deleted: 'D',
  renamed: 'R',
  copied: 'C',
  typeChanged: 'T',
  untracked: '?',
  ignored: '!',
  conflicted: 'U',
}

/** git status 风格的单字母状态码。 */
export function gitStateBadge(state: HoloGitFileState): string {
  return stateBadges[state]
}

const localeKeyByState: Record<HoloGitFileState, keyof StudioLocale> = {
  modified: 'gitStateModified',
  added: 'gitStateAdded',
  deleted: 'gitStateDeleted',
  renamed: 'gitStateRenamed',
  copied: 'gitStateCopied',
  typeChanged: 'gitStateTypeChanged',
  untracked: 'gitStateUntracked',
  ignored: 'gitStateIgnored',
  conflicted: 'gitStateConflicted',
}

/** 状态码的可读名称，用于 aria-label —— 颜色与字母不能是唯一信息载体。 */
export function gitStateLabel(state: HoloGitFileState, locale: StudioLocale): string {
  return locale[localeKeyByState[state]]
}

const groupLocaleKeys: Record<HoloGitGroupId, keyof StudioLocale> = {
  conflicts: 'gitConflicts',
  staged: 'gitStaged',
  changes: 'gitChanges',
  untracked: 'gitUntracked',
}

export function gitGroupLabel(id: HoloGitGroupId, locale: StudioLocale): string {
  return locale[groupLocaleKeys[id]]
}

const inProgressLocaleKeys: Record<NonNullable<HoloGitRepoState['inProgress']>, keyof StudioLocale> = {
  merge: 'gitInProgressMerge',
  rebase: 'gitInProgressRebase',
  'cherry-pick': 'gitInProgressCherryPick',
  revert: 'gitInProgressRevert',
  bisect: 'gitInProgressBisect',
}

export function gitInProgressLabel(operation: NonNullable<HoloGitRepoState['inProgress']>, locale: StudioLocale): string {
  return locale[inProgressLocaleKeys[operation]]
}

export interface CommitAvailability {
  canCommit: boolean
  /** 不可提交时给出唯一的首要原因 locale key；可提交时为 undefined。 */
  reason?: 'message' | 'staged' | 'operation'
}

export function resolveCommitAvailability(input: {
  commitMessage: string
  changes: HoloGitFileChange[]
  repo: HoloGitRepoState
  amend: boolean
  busy?: boolean
  allowEmptyCommit?: boolean
}): CommitAvailability {
  if (input.repo.inProgress) return { canCommit: false, reason: 'operation' }
  if (input.commitMessage.trim().length === 0) return { canCommit: false, reason: 'message' }
  const hasStaged = input.changes.some(change => change.indexState && change.indexState !== 'conflicted')
  if (!hasStaged && !input.allowEmptyCommit && !input.amend) return { canCommit: false, reason: 'staged' }
  return { canCommit: !input.busy }
}

/** 把仓库相对路径拆成目录前缀与文件名，用于两级灰度呈现。 */
export function splitChangePath(path: string): { directory: string; fileName: string } {
  const normalized = path.replace(/\\/g, '/')
  const index = normalized.lastIndexOf('/')
  return index < 0
    ? { directory: '', fileName: normalized }
    : { directory: normalized.slice(0, index), fileName: normalized.slice(index + 1) }
}
