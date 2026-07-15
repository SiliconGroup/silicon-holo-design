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
    return <div className="my-2 flex justify-start px-2"><div className="w-full max-w-[85%]"><AIToolCallCard name={message.toolName!} status={message.toolStatus || 'complete'} arguments={message.toolArguments} result={message.toolResult} durationMs={message.toolDuration} /></div></div>
  }

  const totalCount = messages.length
  const completedCount = messages.filter(message => message.toolStatus === 'complete' || message.toolStatus === 'error').length
  const runningMessage = messages.find(message => message.toolStatus === 'running')
  const hasErrors = messages.some(message => message.toolStatus === 'error')
  const allDone = completedCount === totalCount
  const totalDuration = messages.reduce((sum, message) => sum + (message.toolDuration ?? 0), 0)
  const isOpen = expanded || !allDone

  return (
    <div className="my-3 flex justify-start px-2" role="group" aria-label={locale.ai.toolGroupLabel}>
      <div data-shd-tool-group="true" className={`shd-spectral-panel-raised w-full max-w-[85%] overflow-hidden rounded-md border ${hasErrors ? 'border-stroke-warning' : 'border-stroke-subtle'}`}>
        <button type="button" onClick={() => allDone && setExpanded(current => !current)} aria-expanded={isOpen} aria-controls={regionId} className={`border-none shd-local-focus flex min-h-11 w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 ${allDone ? 'cursor-pointer hover:bg-surface-interactive' : 'cursor-default'}`}>
          <Chevron open={isOpen} />
          {runningMessage ? <HexagonLoader size={16} /> : hasErrors ? <svg className="h-4 w-4 shrink-0 text-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg> : <svg className="h-4 w-4 shrink-0 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
          <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-content-primary">{runningMessage ? formatMessage(locale.ai.toolGroupRunning, { name: runningMessage.toolName! }) : formatMessage(locale.ai.toolGroupSummary, { count: totalCount })}</span>
          {!allDone && <span className="font-mono text-[11px] text-content-tertiary">{formatMessage(locale.ai.toolGroupProgress, { completed: completedCount, total: totalCount })}</span>}
          {allDone && totalDuration > 0 && <span className="font-mono text-[11px] tabular-nums text-content-tertiary">{formatDuration(totalDuration)}</span>}
        </button>
        {isOpen && <div id={regionId} role="region" className="border-t border-stroke-muted bg-surface-canvas py-1">{messages.map(message => <AIToolCallCard grouped key={message.id} name={message.toolName!} status={message.toolStatus || 'complete'} arguments={message.toolArguments} result={message.toolResult} durationMs={message.toolDuration} />)}</div>}
      </div>
    </div>
  )
}
