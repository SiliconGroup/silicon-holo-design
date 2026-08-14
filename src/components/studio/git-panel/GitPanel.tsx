import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { HoloAlert } from '@/components/feedback/alert'
import { HoloButton } from '@/components/general/button'
import { HoloCheckbox } from '@/components/data-entry/checkbox'
import { HoloConfirm } from '@/components/feedback/confirm'
import { HoloEmpty } from '@/components/data-display/empty'
import { HoloSpinner } from '@/components/feedback/spinner'
import { HoloTextarea } from '@/components/data-entry/textarea'
import { HoloTooltip } from '@/components/data-display/tooltip'
import { formatMessage } from '@/locale'
import type { HoloGitFileState, HoloGitPanelProps } from '../types'
import { useStudioLocale, type StudioLocale } from '../utils/use-studio-locale'
import {
  gitGroupLabel,
  gitInProgressLabel,
  gitStateBadge,
  gitStateLabel,
  groupGitChanges,
  resolveCommitAvailability,
  splitChangePath,
  type HoloGitGroup,
  type HoloGitGroupEntry,
  type HoloGitGroupId,
} from './git-panel-model'

const stateColor: Record<HoloGitFileState, string> = {
  modified: 'text-accent-primary',
  added: 'text-status-success',
  deleted: 'text-content-tertiary',
  renamed: 'text-accent-blue',
  copied: 'text-accent-blue',
  typeChanged: 'text-status-warning',
  untracked: 'text-status-success',
  ignored: 'text-content-disabled',
  conflicted: 'text-status-error',
}

const commitReasonKey: Record<'message' | 'staged' | 'operation', keyof StudioLocale> = {
  message: 'gitCommitNeedsMessage',
  staged: 'gitCommitNeedsStaged',
  operation: 'gitCommitBlockedByOperation',
}

const glyphs = {
  diff: 'M4 2.5v7M4 2.5 2 4.5m2-2 2 2M8 9.5v-7M8 9.5l2-2m-2 2-2-2',
  stage: 'M6 2.5v7M2.5 6h7',
  unstage: 'M2.5 6h7',
  discard: 'M3 3l6 6M9 3l-6 6',
  refresh: 'M10 6a4 4 0 1 1-1.2-2.85M10 2v2H8',
  chevron: 'M4 2.5 8 6l-4 3.5',
}

function Glyph({ path }: { path: string }) {
  return (
    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

/** 行内图标操作。视觉与 shd-copy-action 一致，但需要 aria-label 与禁用态，故就地实现。 */
function RowAction({ label, onClick, disabled, children }: { label: string; onClick(): void; disabled?: boolean; children: ReactNode }) {
  return (
    <HoloTooltip content={label}>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={event => { event.stopPropagation(); onClick() }}
        className="border-none shd-control-focus bg-transparent flex h-5 w-5 items-center justify-center rounded-sm text-content-tertiary transition-colors duration-150 hover:bg-surface-interactive hover:text-content-primary disabled:cursor-not-allowed disabled:text-content-disabled"
      >
        {children}
      </button>
    </HoloTooltip>
  )
}

export function HoloGitPanel({
  repo,
  changes,
  commitMessage,
  onCommitMessageChange,
  onStage,
  onUnstage,
  onDiscard,
  onOpenDiff,
  onCommit,
  onRefresh,
  onSelectChange,
  busy = false,
  error,
  allowEmptyCommit = false,
  emptyContent,
  className = '',
}: HoloGitPanelProps) {
  const locale = useStudioLocale()
  const [amend, setAmend] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<HoloGitGroupId[]>([])
  const [discardTarget, setDiscardTarget] = useState<string[] | null>(null)

  const groups = useMemo(() => groupGitChanges(changes).filter(group => group.entries.length > 0), [changes])
  const availability = resolveCommitAvailability({ commitMessage, changes, repo, amend, busy, allowEmptyCommit })
  const blockedReason = availability.reason ? locale[commitReasonKey[availability.reason]] : undefined

  const commit = () => {
    if (availability.canCommit) onCommit?.({ amend })
  }

  const handleMessageKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      commit()
    }
  }

  const renderEntry = (group: HoloGitGroup, entry: HoloGitGroupEntry) => {
    const { change, state } = entry
    const { directory, fileName } = splitChangePath(change.path)
    const isConflict = group.id === 'conflicts'
    const isStaged = group.id === 'staged'
    const displayName = change.originalPath !== undefined
      ? `${splitChangePath(change.originalPath).fileName} → ${fileName}`
      : fileName

    return (
      <li
        key={`${group.id}:${change.path}`}
        className="group flex h-6 items-center gap-1.5 rounded-sm pl-1 pr-0.5 transition-colors duration-150 hover:bg-surface-interactive"
      >
        <span
          aria-label={gitStateLabel(state, locale)}
          title={gitStateLabel(state, locale)}
          className={`w-3 flex-none text-center font-mono text-xs ${stateColor[state]}`}
        >
          {gitStateBadge(state)}
        </span>
        <button
          type="button"
          disabled={busy}
          title={change.path}
          onClick={() => onSelectChange?.(change)}
          className="border-none shd-control-focus bg-transparent flex min-w-0 flex-1 items-center gap-1.5 text-left disabled:cursor-not-allowed"
        >
          {/* 必须允许收缩：flex-none + truncate 会互相矛盾，导致长文件名把整行撑出横向滚动条。 */}
          <span className={`min-w-0 truncate text-xs ${state === 'deleted' ? 'text-content-tertiary line-through' : 'text-content-secondary'}`}>{displayName}</span>
          {directory !== '' && <span className="min-w-0 flex-1 truncate text-[10px] text-content-disabled">{directory}</span>}
        </button>
        {/* focus-within 让键盘用户也能到达行内操作，不只依赖 hover。 */}
        <span className="hidden flex-none items-center gap-0.5 group-hover:flex group-focus-within:flex">
          {onOpenDiff && <RowAction label={locale.gitOpenDiff} disabled={busy} onClick={() => onOpenDiff(change.path, group.side)}>
            <Glyph path={glyphs.diff} />
          </RowAction>}
          {!isStaged && !isConflict && onDiscard && <RowAction label={locale.gitDiscard} disabled={busy} onClick={() => setDiscardTarget([change.path])}>
            <Glyph path={glyphs.discard} />
          </RowAction>}
          {isStaged && onUnstage && <RowAction label={locale.gitUnstage} disabled={busy} onClick={() => onUnstage([change.path])}>
            <Glyph path={glyphs.unstage} />
          </RowAction>}
          {/* 冲突文件在 git 中「标记为已解决」就是 git add，因此复用 onStage。 */}
          {!isStaged && onStage && <RowAction label={isConflict ? locale.gitResolve : locale.gitStage} disabled={busy} onClick={() => onStage([change.path])}>
            <Glyph path={glyphs.stage} />
          </RowAction>}
        </span>
      </li>
    )
  }

  const renderGroup = (group: HoloGitGroup) => {
    const label = gitGroupLabel(group.id, locale)
    const collapsed = collapsedGroups.includes(group.id)
    const paths = group.entries.map(entry => entry.change.path)
    const bulk = group.id === 'staged'
      ? (onUnstage ? { label: locale.gitUnstageAll, glyph: glyphs.unstage, run: () => onUnstage(paths) } : undefined)
      : (group.id !== 'conflicts' && onStage ? { label: locale.gitStageAll, glyph: glyphs.stage, run: () => onStage(paths) } : undefined)

    return (
      <section key={group.id} role="group" aria-label={`${label} (${group.entries.length})`} className="border-b border-stroke-muted last:border-b-0">
        <div className="flex items-center gap-1 px-1">
          <button
            type="button"
            aria-expanded={!collapsed}
            onClick={() => setCollapsedGroups(previous => collapsed ? previous.filter(id => id !== group.id) : [...previous, group.id])}
            className="border-none shd-control-focus bg-transparent flex min-w-0 flex-1 items-center gap-1 py-1.5 text-left text-content-tertiary transition-colors duration-150 hover:text-content-primary"
          >
            <span aria-hidden="true" className={`flex h-3 w-3 flex-none items-center justify-center transition-transform duration-150 ${collapsed ? '' : 'rotate-90'}`}>
              <Glyph path={glyphs.chevron} />
            </span>
            <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em]">{label}</span>
          </button>
          {bulk && <RowAction label={bulk.label} disabled={busy} onClick={bulk.run}><Glyph path={bulk.glyph} /></RowAction>}
          <span className="flex-none font-mono text-[10px] text-content-tertiary">{group.entries.length}</span>
        </div>
        {!collapsed && <ul className="m-0 flex list-none flex-col gap-0.5 px-1 pb-1.5 pt-0">
          {group.entries.map(entry => renderEntry(group, entry))}
        </ul>}
      </section>
    )
  }

  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${className}`}>
      <div role="status" aria-live="polite" aria-label={locale.gitStatusLabel} className="flex flex-none items-center gap-2 border-b border-stroke-muted px-3 py-2 text-xs">
        <span className="min-w-0 truncate text-content-primary">{repo.branch ?? locale.gitNoBranch}</span>
        {repo.detached === true && <span className="flex-none rounded-sm bg-state-warning-soft px-1 text-[10px] text-status-warning">{locale.gitDetached}</span>}
        {repo.upstream !== undefined && <span className="min-w-0 flex-1 truncate text-content-disabled">{repo.upstream}</span>}
        {repo.ahead !== undefined && repo.ahead > 0 && <span className="flex-none text-content-tertiary">{formatMessage(locale.gitAhead, { count: repo.ahead })}</span>}
        {repo.behind !== undefined && repo.behind > 0 && <span className="flex-none text-content-tertiary">{formatMessage(locale.gitBehind, { count: repo.behind })}</span>}
        {onRefresh && <span className="ml-auto flex-none">
          <RowAction label={locale.gitRefresh} disabled={busy} onClick={onRefresh}><Glyph path={glyphs.refresh} /></RowAction>
        </span>}
      </div>

      <div className="shd-scrollbar min-h-0 flex-1 overflow-auto">
        {repo.inProgress !== undefined && <div className="p-2 pb-0">
          <HoloAlert type="warning" title={gitInProgressLabel(repo.inProgress, locale)} />
        </div>}
        {error !== undefined && <div className="p-2 pb-0">
          <HoloAlert type="error" title={error} />
        </div>}

        <div className="flex flex-col gap-2 p-2">
          {/*
            库内没有全局 border-box 重置，而 HoloTextarea 的尺寸内边距落在**内层** textarea 上，
            它同时带 w-full，于是在 content-box 下宽度变成 100% + 20px，把窄侧栏撑出横向滚动条。
            className 只会落到外层，因此这里通过 style（会被展开到内层 textarea）修正盒模型。
          */}
          <HoloTextarea
            style={{ boxSizing: 'border-box' }}
            value={commitMessage}
            onChange={value => onCommitMessageChange(value)}
            onKeyDown={handleMessageKeyDown}
            placeholder={locale.gitCommitPlaceholder}
            aria-label={locale.gitCommitLabel}
            disabled={busy}
            autoResize
            maxAutoHeight={140}
            size="sm"
          />
          <div className="flex items-center justify-between gap-2">
            <HoloCheckbox size="sm" checked={amend} onChange={setAmend} disabled={busy} label={locale.gitAmend} />
            <HoloButton
              size="sm"
              variant="primary"
              onClick={commit}
              disabled={!availability.canCommit || !onCommit}
              icon={busy ? <HoloSpinner size="sm" /> : undefined}
            >
              {locale.gitCommit}
            </HoloButton>
          </div>
          {/* 禁用原因用可见文本而非 tooltip：禁用控件不派发指针事件，tooltip 对键盘与读屏用户不可达。 */}
          {blockedReason !== undefined && <p role="note" className="m-0 text-right text-[10px] text-content-tertiary">{blockedReason}</p>}
        </div>

        {groups.length === 0
          ? (emptyContent ?? <HoloEmpty description={locale.gitEmpty} />)
          : <div className="border-t border-stroke-muted">{groups.map(renderGroup)}</div>}
      </div>

      <HoloConfirm
        open={discardTarget !== null}
        type="danger"
        layout="horizontal"
        title={locale.gitDiscardTitle}
        description={formatMessage(locale.gitDiscardConfirm, { count: discardTarget?.length ?? 0 })}
        confirmText={locale.gitDiscard}
        onCancel={() => setDiscardTarget(null)}
        onConfirm={() => {
          if (discardTarget) onDiscard?.(discardTarget)
          setDiscardTarget(null)
        }}
      />
    </div>
  )
}
