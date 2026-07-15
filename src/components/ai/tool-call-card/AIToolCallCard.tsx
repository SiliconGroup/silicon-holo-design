import { useId, useState } from 'react'
import hljs from 'highlight.js'
import { useLocale } from '@/locale'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
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
  const locale = useLocale()
  const [copied, setCopied] = useState(false)
  let isJson = true
  try { JSON.parse(code) } catch { isJson = false }
  const formatted = formatJson(code)
  const highlighted = hljs.getLanguage('json') ? hljs.highlight(formatted, { language: 'json' }).value : hljs.highlightAuto(formatted).value
  return (
    <div className="overflow-hidden rounded-sm border border-stroke-subtle bg-surface-canvas">
      <div className="flex items-center justify-between border-b border-stroke-muted px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-tertiary">{isJson ? 'JSON' : 'TEXT'}</span>
        <button type="button" onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }} className="border-none rounded-sm px-1.5 py-0.5 text-[10px] text-content-tertiary hover:bg-surface-interactive hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{copied ? locale.ai.copied : locale.ai.copy}</button>
      </div>
      <pre className="m-0 max-h-60 overflow-auto p-3 text-xs text-content-secondary">
        <code className={isJson ? 'language-json' : undefined} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  )
}

function StatusIcon({ status }: { status: ToolStatus }) {
  switch (status) {
    case 'running': return <HexagonLoader size={16} />
    case 'complete': return <svg className="h-4 w-4 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    case 'error': return <svg className="h-4 w-4 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    default: return <span className="h-2 w-2 rounded-full bg-content-tertiary" />
  }
}

function Chevron({ open }: { open: boolean }) {
  return <svg aria-hidden="true" className={`h-3.5 w-3.5 text-content-tertiary transition-transform duration-150 ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 20 20" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="m7 4 6 6-6 6" /></svg>
}

export function AIToolCallCard({ name, status, arguments: args, result, durationMs, grouped = false }: AIToolCallCardProps) {
  const locale = useLocale()
  const regionId = useId()
  const [open, setOpen] = useState(false)
  const hasDetails = Boolean(args || result || status === 'complete' || status === 'error')

  return (
    <article data-shd-tool-card="true" className={grouped
      ? `mx-2 my-1 overflow-hidden rounded-sm border ${status === 'error' ? 'border-stroke-error bg-state-error-soft' : status === 'running' || open ? 'border-stroke-accent bg-accent-primary-softer' : 'border-stroke-muted bg-surface-raised'}`
      : 'shd-spectral-panel-raised my-2 overflow-hidden rounded-md border border-stroke-subtle'}>
      <button
        type="button"
        disabled={!hasDetails}
        aria-expanded={hasDetails ? open : undefined}
        aria-controls={hasDetails ? regionId : undefined}
        onClick={() => hasDetails && setOpen(current => !current)}
        className="border-none shd-local-focus flex min-h-10 w-full items-center gap-2.5 px-3 py-2 text-left transition-colors duration-150 hover:bg-surface-interactive disabled:cursor-default"
      >
        <span className={`w-4 ${hasDetails ? '' : 'invisible'}`}><Chevron open={open} /></span>
        <StatusIcon status={status} />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-content-primary">{name}</span>
        <span className="font-mono text-[11px] tabular-nums text-content-tertiary">{durationMs == null ? '' : durationMs >= 1000 ? `${(durationMs / 1000).toFixed(1)}s` : `${durationMs}ms`}</span>
      </button>

      {open && hasDetails && (
        <div id={regionId} role="region" className="border-t border-stroke-muted bg-surface-base px-3 pb-3">
          {args && <section className="mt-2"><div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-content-tertiary">{locale.ai.toolArguments}</div><PayloadBlock code={args} /></section>}
          {result ? <section className="mt-2"><div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-content-tertiary">{locale.ai.toolResult}</div><PayloadBlock code={result} /></section> : status === 'complete' && <div className="mt-2 text-xs italic text-content-disabled">{locale.ai.toolNoResult}</div>}
        </div>
      )}
    </article>
  )
}
