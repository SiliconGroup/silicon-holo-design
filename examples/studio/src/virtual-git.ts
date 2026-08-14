import type { HoloGitFileChange, HoloGitRepoState, HoloTreeNodeStatus } from '@/components/studio'

/**
 * Host adapter: an in-memory git state machine.
 *
 * The library implements no git logic. This derives HoloGitFileChange[] from three sets
 * (dirty / staged / untracked), which is the step downstream performs with libgit2 or the git CLI.
 *
 * Key point: one file can have staged **and** unstaged modifications at the same time. Then
 * indexState and worktreeState are both set and the panel lists it in Staged and in Changes.
 * That is correct git semantics.
 */
export interface VirtualGitState {
  dirty: Set<string>
  staged: Set<string>
  untracked: Set<string>
  commits: { message: string; amend: boolean; paths: string[]; at: string }[]
}

/** The initial state is deliberately non-empty so Source Control has content on first paint. */
export function createVirtualGitState(): VirtualGitState {
  return {
    dirty: new Set(['src/styles/theme.css']),
    staged: new Set(['src/lib/format.ts']),
    untracked: new Set(['data/telemetry.ndjson']),
    commits: [],
  }
}

export const virtualRepo: HoloGitRepoState = {
  branch: 'feature/studio-demo',
  upstream: 'origin/feature/studio-demo',
  ahead: 2,
  behind: 1,
}

export function deriveChanges(state: VirtualGitState): HoloGitFileChange[] {
  const paths = new Set([...state.dirty, ...state.staged, ...state.untracked])
  const changes: HoloGitFileChange[] = []
  for (const path of [...paths].sort()) {
    if (state.untracked.has(path) && !state.staged.has(path)) {
      changes.push({ path, worktreeState: 'untracked' })
      continue
    }
    changes.push({
      path,
      ...(state.staged.has(path) ? { indexState: 'modified' as const } : {}),
      ...(state.dirty.has(path) ? { worktreeState: 'modified' as const } : {}),
    })
  }
  return changes
}

/** git status to tree node colouring. The host owns this mapping; the component assumes nothing. */
export function deriveTreeStatus(state: VirtualGitState, path: string): HoloTreeNodeStatus | undefined {
  if (state.untracked.has(path) && !state.staged.has(path)) return 'untracked'
  if (state.dirty.has(path)) return 'modified'
  if (state.staged.has(path)) return 'added'
  return undefined
}

export function stage(state: VirtualGitState, paths: string[]): VirtualGitState {
  const staged = new Set(state.staged)
  const dirty = new Set(state.dirty)
  const untracked = new Set(state.untracked)
  for (const path of paths) {
    staged.add(path)
    dirty.delete(path)
    untracked.delete(path)
  }
  return { ...state, staged, dirty, untracked }
}

export function unstage(state: VirtualGitState, paths: string[]): VirtualGitState {
  const staged = new Set(state.staged)
  const dirty = new Set(state.dirty)
  for (const path of paths) {
    staged.delete(path)
    dirty.add(path)
  }
  return { ...state, staged, dirty }
}

export function discard(state: VirtualGitState, paths: string[]): VirtualGitState {
  const dirty = new Set(state.dirty)
  for (const path of paths) dirty.delete(path)
  return { ...state, dirty }
}

export function markDirty(state: VirtualGitState, path: string): VirtualGitState {
  if (state.staged.has(path) || state.untracked.has(path)) {
    // Editing an already staged file leaves index and worktree states side by side
    const dirty = new Set(state.dirty)
    dirty.add(path)
    return { ...state, dirty }
  }
  const dirty = new Set(state.dirty)
  dirty.add(path)
  return { ...state, dirty }
}

/** 未跟踪的文件没有 HEAD 版本，diff 应当与空文档对比。 */
export function isUntracked(state: VirtualGitState, path: string): boolean {
  return state.untracked.has(path) && !state.staged.has(path)
}

export function commit(state: VirtualGitState, message: string, amend: boolean): VirtualGitState {
  const paths = [...state.staged]
  const at = new Date().toISOString().slice(11, 19)
  return { ...state, staged: new Set(), commits: [{ message, amend, paths, at }, ...state.commits] }
}
