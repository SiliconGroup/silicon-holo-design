import { useId, useState, type ReactNode } from 'react'
import { formatMessage, useLocale } from '@/locale'

export type AITaskExecutionStatus = 'pending' | 'running' | 'completed' | 'error' | 'cancelled' | 'blocked' | 'skipped'

export interface AITaskExecutionTask {
  id: string
  description: string
  completed?: boolean
  status?: AITaskExecutionStatus
  progress?: number
}

export interface AITaskExecutionList<TTask extends AITaskExecutionTask = AITaskExecutionTask> {
  description: string
  tasks: readonly TTask[]
}

export interface AITaskExecutionPanelProps<TTask extends AITaskExecutionTask = AITaskExecutionTask> {
  taskList: AITaskExecutionList<TTask>
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  headerMeta?: ReactNode
  getTaskStatus?: (task: TTask) => AITaskExecutionStatus
  getTaskProgress?: (task: TTask) => number | undefined
  renderTaskDetails?: (task: TTask) => ReactNode
  renderTaskActions?: (task: TTask) => ReactNode
  className?: string
}

const statusStyle: Record<AITaskExecutionStatus, { icon: string; container: string; iconClass: string; text: string }> = {
  pending: { icon: '○', container: 'border-stroke-muted', iconClass: 'text-content-tertiary', text: 'text-content-secondary' },
  running: { icon: '◌', container: 'border-stroke-accent', iconClass: 'text-content-accent', text: 'text-content-primary' },
  completed: { icon: '✓', container: 'border-stroke-success', iconClass: 'text-status-success', text: 'text-content-primary' },
  error: { icon: '×', container: 'border-stroke-error', iconClass: 'text-status-error', text: 'text-content-primary' },
  cancelled: { icon: '−', container: 'border-stroke-muted', iconClass: 'text-content-tertiary', text: 'text-content-tertiary' },
  blocked: { icon: '!', container: 'border-stroke-warning', iconClass: 'text-status-warning', text: 'text-content-primary' },
  skipped: { icon: '↷', container: 'border-stroke-muted', iconClass: 'text-content-secondary', text: 'text-content-secondary' },
}

function clampProgress(progress: number | undefined) {
  if (progress === undefined || Number.isNaN(progress)) return undefined
  return Math.min(100, Math.max(0, progress))
}

export function AITaskExecutionPanel<TTask extends AITaskExecutionTask = AITaskExecutionTask>({
  taskList,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  headerMeta,
  getTaskStatus,
  getTaskProgress,
  renderTaskDetails,
  renderTaskActions,
  className = '',
}: AITaskExecutionPanelProps<TTask>) {
  const locale = useLocale()
  const regionId = useId()
  const headingId = useId()
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const expanded = controlledExpanded ?? internalExpanded
  const resolveStatus = (task: TTask): AITaskExecutionStatus => getTaskStatus?.(task) ?? task.status ?? (task.completed ? 'completed' : 'pending')
  const taskStates = taskList.tasks.map(task => {
    const status = resolveStatus(task)
    const progress = clampProgress(getTaskProgress?.(task) ?? task.progress)
    return { task, status, progress }
  })
  const total = taskStates.length
  const completed = taskStates.filter(({ status }) => status === 'completed').length
  const progressTotal = taskStates.reduce((sum, { status, progress }) => sum + (status === 'completed' ? 100 : status === 'running' ? progress ?? 0 : 0), 0)
  const percent = total === 0 ? 0 : Math.round(progressTotal / total)
  const complete = total > 0 && completed === total
  const hasError = taskStates.some(({ status }) => status === 'error' || status === 'blocked')
  const hasRunning = taskStates.some(({ status }) => status === 'running')
  const hasCancelled = taskStates.some(({ status }) => status === 'cancelled')
  const hasSkipped = taskStates.some(({ status }) => status === 'skipped')
  const hasPending = taskStates.some(({ status }) => status === 'pending')
  const label = locale.ai.taskExecutionLabel ?? 'Task execution'
  const progressTemplate = locale.ai.taskExecutionProgress ?? '{completed}/{total} complete'
  const progressLabel = locale.ai.taskExecutionProgressLabel ?? 'Task completion progress'
  const expandLabel = locale.ai.taskExecutionExpand ?? `${locale.common.expand} ${label}`
  const collapseLabel = locale.ai.taskExecutionCollapse ?? `${locale.common.collapse} ${label}`
  const emptyLabel = locale.ai.taskExecutionEmpty ?? locale.common.empty
  const statusLabels: Record<AITaskExecutionStatus, string> = {
    pending: locale.ai.taskPending ?? locale.ai.toolPending,
    running: locale.ai.taskRunning ?? locale.ai.toolRunning,
    completed: locale.ai.taskCompleted ?? locale.ai.toolComplete,
    error: locale.ai.taskError ?? locale.ai.toolError,
    cancelled: locale.ai.taskCancelled ?? 'Cancelled',
    blocked: locale.ai.taskBlocked ?? 'Blocked',
    skipped: locale.ai.taskSkipped ?? 'Skipped',
  }
  const summaryStatus: AITaskExecutionStatus = taskStates.some(({ status }) => status === 'error')
    ? 'error'
    : taskStates.some(({ status }) => status === 'blocked')
        ? 'blocked'
        : hasRunning
          ? 'running'
        : hasPending
            ? 'pending'
            : hasCancelled
              ? 'cancelled'
            : hasSkipped
          ? 'skipped'
          : complete
          ? 'completed'
          : 'pending'
  const summaryStatusLabel = statusLabels[summaryStatus]
  const summaryIcon = statusStyle[summaryStatus].icon

  const handleToggle = () => {
    const nextExpanded = !expanded
    if (controlledExpanded === undefined) setInternalExpanded(nextExpanded)
    onExpandedChange?.(nextExpanded)
  }

  return (
    <section
      data-shd-task-execution="true"
      data-shd-task-status={summaryStatus}
      data-shd-state={summaryStatus}
      role="group"
      aria-label={label}
      className={`shd-status-glass shd-task-execution-panel overflow-hidden rounded-md border ${complete ? 'border-stroke-success' : hasError ? 'border-stroke-warning' : 'border-stroke-subtle'} ${className}`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={regionId}
        aria-label={`${expanded ? collapseLabel : expandLabel}, ${summaryStatusLabel}, ${formatMessage(progressTemplate, { completed, total })}`}
        onClick={handleToggle}
        className="border-none shd-local-focus shd-status-glass-header shd-task-execution-header flex min-h-12 w-full flex-wrap items-center gap-x-2.5 gap-y-1 px-3 py-2.5 text-left transition-colors duration-150"
      >
        <svg aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 text-content-tertiary transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 20 20" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="m7 4 6 6-6 6" />
        </svg>
        <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${complete ? 'border-stroke-success bg-state-success-soft text-status-success' : hasError ? 'border-stroke-warning bg-state-warning-soft text-status-warning' : 'border-stroke-accent bg-accent-primary-softer text-content-accent'}`}>{summaryIcon}</span>
        <span id={headingId} className="shrink-0 text-sm font-semibold text-content-primary">{label}</span>
        <span aria-hidden="true" className="text-stroke-accent">·</span>
        <span className="min-w-32 flex-1 truncate text-xs text-content-secondary" title={taskList.description}>{taskList.description}</span>
        {headerMeta != null && <span className="shrink-0 text-[11px] text-content-tertiary">{headerMeta}</span>}
        <span className={`shrink-0 font-mono text-[11px] tabular-nums ${complete ? 'text-status-success' : hasError ? 'text-status-warning' : 'text-content-accent'}`}>
          {formatMessage(progressTemplate, { completed, total })}
        </span>
      </button>

      {expanded && (
        <div id={regionId} role="region" aria-labelledby={headingId} className="shd-status-glass-body shd-task-execution-body border-t border-stroke-muted px-3 pb-3 pt-3">
          <div className="flex items-center gap-3">
            <div
              role="progressbar"
              aria-label={progressLabel}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              className="h-1 flex-1 overflow-hidden rounded-full bg-stroke-subtle"
            >
              <div className={`h-full rounded-full transition-[width] duration-200 ${complete ? 'bg-status-success' : hasError ? 'bg-status-warning' : 'bg-accent-primary'}`} style={{ width: `${percent}%` }} />
            </div>
            <span className={`font-mono text-[11px] tabular-nums ${complete ? 'text-status-success' : hasError ? 'text-status-warning' : 'text-content-accent'}`}>{percent}%</span>
          </div>

          <div className="mt-3 break-words text-sm font-semibold text-content-primary">{taskList.description}</div>
          {total === 0 ? (
            <div className="mt-3 rounded-sm border border-dashed border-stroke-muted px-3 py-4 text-center text-xs text-content-tertiary">{emptyLabel}</div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {taskStates.map(({ task, status, progress }) => {
                const details = renderTaskDetails?.(task)
                const actions = renderTaskActions?.(task)
                const style = statusStyle[status]
                return (
                  <div key={task.id} data-shd-task-item-status={status} data-shd-state={status} className={`shd-status-glass-item shd-task-execution-item rounded-sm border px-3 py-2.5 ${style.container}`}>
                    <div className="grid grid-cols-[18px_minmax(0,1fr)] gap-2">
                      <span aria-hidden="true" className={`font-mono text-sm leading-5 ${style.iconClass}`}>{style.icon}</span>
                      <div className="min-w-0">
                        <span className="sr-only">{statusLabels[status]}: </span>
                        <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                          <div className={`min-w-0 flex-1 break-words text-sm ${style.text}`}>{task.description}</div>
                          {actions != null && <div className="shrink-0">{actions}</div>}
                        </div>
                        {progress !== undefined && status !== 'completed' && status !== 'skipped' && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-stroke-subtle"><div className="h-full bg-accent-primary" style={{ width: `${progress}%` }} /></div>
                            <span className="font-mono text-[10px] tabular-nums text-content-tertiary">{Math.round(progress)}%</span>
                          </div>
                        )}
                        {details != null && <div className="mt-1.5 break-words text-xs leading-5 text-content-tertiary">{details}</div>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
