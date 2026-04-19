import { useState, useCallback, useId } from 'react'
import { useLocale, formatMessage } from '@/locale'
import { HoloTag } from '@/components/data-display/tag'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
import { AIToolCallCard } from '@/components/ai/tool-call-card'
import type { ChatMessage } from '@/types'

interface AIToolCallGroupProps {
  messages: ChatMessage[]
}

export function AIToolCallGroup({ messages }: AIToolCallGroupProps) {
  const locale = useLocale()
  const [expanded, setExpanded] = useState(false)
  const toggle = useCallback(() => setExpanded((v) => !v), [])
  const regionId = useId()

  if (messages.length === 0) return null

  if (messages.length === 1) {
    const msg = messages[0]
    return (
      <div className="flex justify-start my-2 px-2">
        <div className="max-w-[85%]">
          <AIToolCallCard
            name={msg.toolName!}
            status={msg.toolStatus || 'complete'}
            arguments={msg.toolArguments}
            result={msg.toolResult}
            durationMs={msg.toolDuration}
          />
        </div>
      </div>
    )
  }

  const totalCount = messages.length
  const completedCount = messages.filter(m => m.toolStatus === 'complete' || m.toolStatus === 'error').length
  const runningMessage = messages.find(m => m.toolStatus === 'running')
  const hasErrors = messages.some(m => m.toolStatus === 'error')
  const allDone = completedCount === totalCount
  const totalDuration = messages.reduce((sum, m) => sum + (m.toolDuration ?? 0), 0)

  return (
    <div className="flex justify-start my-2 px-2" role="group" aria-label={locale.ai.toolGroupLabel}>
      <div className="max-w-[85%]">
        <div className={`rounded-md overflow-hidden border backdrop-blur-sm ${runningMessage ? 'border-holo-cyan/20 bg-holo-cyan/5' : 'border-holo-blue/15 bg-holo-blue/5'}`}>
          {allDone ? (
            <button
              type="button"
              onClick={toggle}
              className="flex items-center gap-2 px-3 py-2 w-full cursor-pointer bg-transparent border-0 text-left"
              aria-expanded={expanded}
              aria-controls={regionId}
            >
              <span className={`text-white/30 text-[10px] transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}>▶</span>
              {hasErrors ? (
                <svg className="w-4 h-4 text-status-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-status-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              )}
              <span className="font-mono text-sm text-holo-cyan flex-1 min-w-0 truncate">
                ⚡ {formatMessage(locale.ai.toolGroupSummary, { count: totalCount })}
              </span>
              {totalDuration > 0 && <HoloTag size="sm">{totalDuration >= 1000 ? `${(totalDuration / 1000).toFixed(1)}s` : `${totalDuration}ms`}</HoloTag>}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2">
              <HexagonLoader size={16} />
              <span className="font-mono text-sm text-holo-cyan flex-1 min-w-0 truncate">
                ⚡ {runningMessage
                  ? formatMessage(locale.ai.toolGroupRunning, { name: runningMessage.toolName! })
                  : locale.ai.toolPending}
              </span>
              <HoloTag size="sm">{formatMessage(locale.ai.toolGroupProgress, { completed: completedCount, total: totalCount })}</HoloTag>
            </div>
          )}

          {(expanded || !allDone) && (
            <div id={regionId} role="region" className="px-2 pb-2 border-t border-holo-blue/10 [&>*]:my-1 [&>*]:border-0 [&>*]:bg-transparent">
              {messages.map((msg) => (
                <AIToolCallCard
                  key={msg.id}
                  name={msg.toolName!}
                  status={msg.toolStatus || 'complete'}
                  arguments={msg.toolArguments}
                  result={msg.toolResult}
                  durationMs={msg.toolDuration}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
