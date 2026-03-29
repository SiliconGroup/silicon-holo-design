import { useState, useCallback } from 'react'
import hljs from 'highlight.js'
import { useLocale } from '@/locale'
import { HoloTag } from '@/components/data-display/tag'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
import type { ToolStatus } from '@/types'

interface AIToolCallCardProps {
  name: string
  status: ToolStatus
  arguments?: string
  result?: string
  durationMs?: number
}

function formatJson(str: string): string {
  try { return JSON.stringify(JSON.parse(str), null, 2) } catch { return str }
}

function HighlightedJson({ code }: { code: string }) {
  const formatted = formatJson(code)
  const html = hljs.getLanguage('json') ? hljs.highlight(formatted, { language: 'json' }).value : formatted
  return (
    <pre className="m-0 p-3 bg-scene-void/80 rounded text-xs overflow-auto" style={{ maxHeight: 200 }}>
      <code className="language-json" dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  )
}

function StatusIcon({ status }: { status: ToolStatus }) {
  switch (status) {
    case 'running': return <HexagonLoader size={16} />
    case 'complete': return <svg className="w-4 h-4 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    case 'error': return <svg className="w-4 h-4 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    default: return <div className="w-2 h-2 rounded-full bg-white/30" />
  }
}

export function AIToolCallCard({ name, status, arguments: args, result, durationMs }: AIToolCallCardProps) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])

  const isRunning = status === 'running'
  const hasDetails = args || result

  return (
    <div className={`my-2 rounded-md overflow-hidden border backdrop-blur-sm ${isRunning ? 'border-holo-cyan/20 bg-holo-cyan/5' : 'border-holo-blue/15 bg-holo-blue/5'}`}>
      <div onClick={hasDetails ? toggle : undefined} className={`flex items-center gap-2 px-3 py-2 ${hasDetails ? 'cursor-pointer' : ''}`}>
        {hasDetails && (
          <span className={`text-white/30 text-[10px] transition-transform duration-150 ${open ? 'rotate-90' : ''}`}>▶</span>
        )}
        <StatusIcon status={status} />
        <span className="font-mono text-sm text-holo-cyan flex-1 min-w-0 truncate">⚡ {name}</span>
        {durationMs != null && <HoloTag size="sm">{durationMs}ms</HoloTag>}
      </div>

      {open && hasDetails && (
        <div className="px-3 pb-3 border-t border-holo-blue/10">
          {args && (
            <div className="mt-2">
              <div className="text-[11px] text-white/35 mb-1">{locale.ai.toolArguments}</div>
              <HighlightedJson code={args} />
            </div>
          )}
          {result ? (
            <div className="mt-2">
              <div className="text-[11px] text-white/35 mb-1">{locale.ai.toolResult}</div>
              <HighlightedJson code={result} />
            </div>
          ) : status === 'complete' && (
            <div className="mt-2 text-xs text-white/25 italic">{locale.ai.toolNoResult}</div>
          )}
        </div>
      )}
    </div>
  )
}
