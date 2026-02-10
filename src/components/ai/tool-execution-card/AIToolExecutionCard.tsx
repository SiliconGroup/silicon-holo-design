import type { ToolStatus } from '@/types'
import { GlowCard } from '@/components/general/glow-card'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
import { useLocale } from '@/locale'

interface AIToolExecutionCardProps { toolName: string; status: ToolStatus; result?: string }

export function AIToolExecutionCard({ toolName, status, result }: AIToolExecutionCardProps) {
  const locale = useLocale()
  const isRunning = status === 'running'
  const isComplete = status === 'complete'
  const isError = status === 'error'
  const statusText = isRunning ? locale.ai.toolRunning : isComplete ? locale.ai.toolComplete : isError ? locale.ai.toolError : locale.ai.toolPending

  return (
    <GlowCard className="p-4" variant={isRunning ? 'intense' : isComplete ? 'elevated' : 'default'}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex-center">
          {isRunning ? <HexagonLoader size={32} /> : isComplete ? (
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex-center"><svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
          ) : isError ? (
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex-center"><svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/10 flex-center"><div className="w-2 h-2 rounded-full bg-white/30" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm text-cyan-400">{toolName}</div>
          <div className="text-xs text-white/40 mt-1">{statusText}</div>
        </div>
      </div>
      {result && isComplete && (
        <div className="mt-3 pt-3 border-t border-cyan-500/10">
          <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap max-h-32 overflow-auto">{result}</pre>
        </div>
      )}
    </GlowCard>
  )
}
