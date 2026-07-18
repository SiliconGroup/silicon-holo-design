import type { ToolStatus } from '@/types'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
import { useLocale } from '@/locale'

interface AIToolExecutionCardProps { toolName: string; status: ToolStatus; result?: string }

export function AIToolExecutionCard({ toolName, status, result }: AIToolExecutionCardProps) {
  const locale = useLocale()
  const isRunning = status === 'running'
  const isComplete = status === 'complete'
  const isError = status === 'error'
  const statusText = isRunning ? locale.ai.toolRunning : isComplete ? locale.ai.toolComplete : isError ? locale.ai.toolError : locale.ai.toolPending
  const borderClass = isRunning ? 'border-stroke-accent' : isComplete ? 'border-stroke-success' : isError ? 'border-stroke-error' : 'border-stroke-muted'

  return (
    <article data-shd-tool-execution="true" data-shd-state={status} className={`shd-status-glass overflow-hidden rounded-md border ${borderClass}`}>
      <div className="shd-status-glass-header flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 flex-center rounded bg-surface-interactive">
          {isRunning ? <HexagonLoader size={24} /> : isComplete ? (
            <svg className="w-4 h-4 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : isError ? (
            <svg className="w-4 h-4 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : <span className="w-2 h-2 rounded-full bg-content-tertiary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[13px] text-content-primary truncate">{toolName}</div>
          <div data-shd-tool-status className="shd-status-text mt-1 text-xs">{statusText}</div>
        </div>
      </div>
      {result && (isComplete || isError) && (
        <div className="mx-4 mb-4 pt-3 border-t border-stroke-muted">
          <pre className="shd-status-glass-inset shd-scrollbar m-0 p-3 rounded border border-stroke-muted text-xs text-content-secondary font-mono whitespace-pre-wrap max-h-40 overflow-auto">{result}</pre>
        </div>
      )}
    </article>
  )
}
