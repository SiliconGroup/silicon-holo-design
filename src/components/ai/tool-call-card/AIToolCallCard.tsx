import { useId, useState } from 'react'
import hljs from 'highlight.js'
import { useLocale } from '@/locale'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
import { CopyAction } from '@/components/ai/copy-action/CopyAction'
import type { ToolStatus } from '@/types'

interface AIToolCallCardProps {
  name: string
  status: ToolStatus
  arguments?: string
  result?: string
  durationMs?: number
  grouped?: boolean
}

function formatJson(value: string): string {
  try { return JSON.stringify(JSON.parse(value), null, 2) } catch { return value }
}

function PayloadBlock({ code }: { code: string }) {
  let isJson = true
  try { JSON.parse(code) } catch { isJson = false }
  const formatted = formatJson(code)
  const highlighted = hljs.getLanguage('json') ? hljs.highlight(formatted, { language: 'json' }).value : hljs.highlightAuto(formatted).value
  return (
    <div className="shd-status-glass-inset overflow-hidden rounded-sm border border-stroke-subtle">
      <div className="flex items-center justify-between border-b border-stroke-muted px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-tertiary">{isJson ? 'JSON' : 'TEXT'}</span>
        <CopyAction content={code} />
      </div>
      <pre className="m-0 max-h-60 overflow-auto p-3 text-xs text-content-secondary">
        <code className={isJson ? 'language-json' : undefined} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  )
}

function StatusIcon({ status }: { status: ToolStatus }) {
  switch (status) {
    case 'running': return <span aria-hidden="true"><HexagonLoader size={16} /></span>
    case 'complete': return <svg aria-hidden="true" className="h-4 w-4 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    case 'error': return <svg aria-hidden="true" className="h-4 w-4 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    default: return <span aria-hidden="true" className="h-2 w-2 rounded-full bg-content-tertiary" />
  }
}

function Chevron({ open }: { open: boolean }) {
  return <svg aria-hidden="true" className={`h-3.5 w-3.5 text-content-tertiary transition-transform duration-150 ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 20 20" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="m7 4 6 6-6 6" /></svg>
}

const statusBorder: Record<ToolStatus, string> = {
  pending: 'border-stroke-muted',
  running: 'border-stroke-accent',
  complete: 'border-stroke-success',
  error: 'border-stroke-error',
}

export function AIToolCallCard({ name, status, arguments: args, result, durationMs, grouped = false }: AIToolCallCardProps) {
  const locale = useLocale()
  const regionId = useId()
  const [open, setOpen] = useState(false)
  const hasDetails = Boolean(args || result || status === 'complete')
  const statusLabel = status === 'running' ? locale.ai.toolRunning : status === 'complete' ? locale.ai.toolComplete : status === 'error' ? locale.ai.toolError : locale.ai.toolPending
  const actionLabel = hasDetails ? (open ? locale.common.collapse : locale.common.expand) : ''

  return (
    <article
      data-shd-tool-card="true"
      data-shd-state={status}
      data-shd-open={open ? 'true' : 'false'}
      className={`shd-status-glass overflow-hidden border ${statusBorder[status]} ${grouped ? 'mx-2 my-1 rounded-sm' : 'rounded-md'}`}
    >
      <button
        type="button"
        disabled={!hasDetails}
        aria-label={`${name}, ${statusLabel}${actionLabel ? `, ${actionLabel}` : ''}`}
        aria-expanded={hasDetails ? open : undefined}
        aria-controls={hasDetails ? regionId : undefined}
        onClick={() => hasDetails && setOpen(current => !current)}
        className="box-border border-none shd-local-focus shd-status-glass-header flex min-h-10 w-full items-center gap-2.5 px-3 py-2 text-left transition-colors duration-150 disabled:cursor-default"
      >
        <span className={`w-4 ${hasDetails ? '' : 'invisible'}`}><Chevron open={open} /></span>
        <StatusIcon status={status} />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-content-primary">{name}</span>
        <span data-shd-tool-status className="shd-status-text shrink-0 whitespace-nowrap text-[11px]">{statusLabel}</span>
        <span className="shrink-0 whitespace-nowrap font-mono text-[11px] tabular-nums text-content-tertiary">{durationMs == null ? '' : durationMs >= 1000 ? `${(durationMs / 1000).toFixed(1)}s` : `${durationMs}ms`}</span>
      </button>

      {open && hasDetails && (
        <div id={regionId} role="region" aria-label={`${name} ${locale.ai.toolResult}`} className="shd-status-glass-body border-t border-stroke-muted px-3 pb-3">
          {args && <section className="mt-2"><div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-content-tertiary">{locale.ai.toolArguments}</div><PayloadBlock code={args} /></section>}
          {result ? <section className="mt-2"><div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-content-tertiary">{locale.ai.toolResult}</div><PayloadBlock code={result} /></section> : status === 'complete' && <div className="mt-2 text-xs italic text-content-disabled">{locale.ai.toolNoResult}</div>}
        </div>
      )}
    </article>
  )
}
