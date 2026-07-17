import { useId, useState } from 'react'
import { useLocale, formatMessage } from '@/locale'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
import { AIToolCallCard } from '@/components/ai/tool-call-card'
import type { ChatMessage } from '@/types'

interface AIToolCallGroupProps { messages: ChatMessage[] }

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) return `${durationMs}ms`
  const seconds = durationMs / 1000
  return `${seconds >= 10 ? seconds.toFixed(0) : seconds.toFixed(1).replace(/\.0$/, '')}s`
}

function Chevron({ open }: { open: boolean }) {
  return <svg aria-hidden="true" className={`h-3.5 w-3.5 text-content-tertiary transition-transform duration-150 ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 20 20" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="m7 4 6 6-6 6" /></svg>
}

export function AIToolCallGroup({ messages }: AIToolCallGroupProps) {
  const locale = useLocale()
  const regionId = useId()
  const [expanded, setExpanded] = useState(false)

  if (messages.length === 0) return null
  if (messages.length === 1) {
    const message = messages[0]
    return <div className="my-4 flex justify-start"><div className="w-full max-w-[78%]"><AIToolCallCard name={message.toolName!} status={message.toolStatus || 'pending'} arguments={message.toolArguments} result={message.toolResult} durationMs={message.toolDuration} /></div></div>
  }

  const totalCount = messages.length
  const completedCount = messages.filter(message => message.toolStatus === 'complete').length
  const settledCount = messages.filter(message => message.toolStatus === 'complete' || message.toolStatus === 'error').length
  const runningMessage = messages.find(message => message.toolStatus === 'running')
  const hasErrors = messages.some(message => message.toolStatus === 'error')
  const hasPending = messages.some(message => !message.toolStatus || message.toolStatus === 'pending')
  const allDone = settledCount === totalCount
  const totalDuration = messages.reduce((sum, message) => sum + (message.toolDuration ?? 0), 0)
  const isOpen = expanded || !allDone
  const groupStatus = hasErrors ? locale.ai.toolError : runningMessage ? locale.ai.toolRunning : hasPending ? locale.ai.toolPending : locale.ai.toolComplete
  const groupSummary = runningMessage && !hasErrors
    ? formatMessage(locale.ai.toolGroupRunning, { name: runningMessage.toolName! })
    : formatMessage(locale.ai.toolGroupSummary, { count: totalCount })
  const headerContent = (
    <>
      <Chevron open={isOpen} />
      {hasErrors ? <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg> : runningMessage ? <HexagonLoader size={16} /> : hasPending ? <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full border border-stroke-strong bg-surface-interactive" /> : <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
      <span data-shd-tool-summary className="min-w-0 flex-1 truncate font-mono text-[13px] text-content-primary" title={groupSummary}>{groupSummary}</span>
      {!allDone && <span data-shd-tool-meta className="shrink-0 whitespace-nowrap font-mono text-[11px] tabular-nums text-content-tertiary">{formatMessage(locale.ai.toolGroupProgress, { completed: completedCount, total: totalCount })}</span>}
      {allDone && totalDuration > 0 && <span data-shd-tool-meta className="shrink-0 whitespace-nowrap font-mono text-[11px] tabular-nums text-content-tertiary">{formatDuration(totalDuration)}</span>}
    </>
  )

  return (
    <div className="my-4 flex justify-start" role="group" aria-label={locale.ai.toolGroupLabel}>
      <div data-shd-tool-group="true" className={`shd-spectral-glass box-border w-full max-w-[78%] overflow-hidden rounded-md border ${hasErrors ? 'border-stroke-warning' : 'border-stroke-subtle'}`}>
        {allDone ? (
          <button type="button" onClick={() => setExpanded(current => !current)} aria-label={`${groupSummary}, ${groupStatus}, ${isOpen ? locale.common.collapse : locale.common.expand}`} aria-expanded={isOpen} aria-controls={regionId} className="box-border border-none shd-local-focus flex min-h-11 w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface-interactive">
            {headerContent}
          </button>
        ) : (
          <div role="status" aria-label={`${groupSummary}, ${groupStatus}`} className="box-border flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-left">
            {headerContent}
          </div>
        )}
        {isOpen && <div id={regionId} role="region" aria-label={locale.ai.toolGroupLabel} className="shd-surface-inset border-t border-stroke-muted py-1">{messages.map(message => <AIToolCallCard grouped key={message.id} name={message.toolName!} status={message.toolStatus || 'pending'} arguments={message.toolArguments} result={message.toolResult} durationMs={message.toolDuration} />)}</div>}
      </div>
    </div>
  )
}
