import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import hljs from 'highlight.js'
import type { Artifact } from '@/types'
import { useArtifactText } from '../use-artifact-resource'
import { RendererError, RendererLoading } from './RendererState'

function resolveMermaidColor(container: HTMLElement, variable: string, fallback: string) {
  const probe = document.createElement('span')
  probe.style.color = `var(${variable}, ${fallback})`
  probe.style.display = 'none'
  container.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')
  if (!context) return fallback
  context.fillStyle = resolved || fallback
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data
  return `rgba(${red}, ${green}, ${blue}, ${(alpha / 255).toFixed(3)})`
}

function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const id = useRef(`artifact-mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { default: mermaid } = await import('mermaid')
        const container = ref.current
        if (!container) return
        mermaid.initialize({ startOnLoad: false, theme: 'dark', themeVariables: {
          primaryColor: resolveMermaidColor(container, '--shd-accent-primary-soft', '#08313a'),
          primaryBorderColor: resolveMermaidColor(container, '--shd-stroke-accent', '#39aab7'),
          primaryTextColor: resolveMermaidColor(container, '--shd-content-primary', '#f3fbff'),
          lineColor: resolveMermaidColor(container, '--shd-accent-primary-hover', '#65e2ee'),
          secondaryColor: resolveMermaidColor(container, '--shd-accent-primary-softer', '#06232b'),
          tertiaryColor: resolveMermaidColor(container, '--shd-surface-base', '#001219'),
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '13px',
        } })
        const result = await mermaid.render(id.current, code.trim())
        if (!cancelled && ref.current) {
          ref.current.innerHTML = result.svg
          ref.current.dataset.shdMermaid = 'ready'
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason))
      }
    })()
    return () => { cancelled = true }
  }, [code])

  if (error) return <pre data-shd-mermaid="error" data-shd-mermaid-error={error} className="whitespace-pre-wrap text-xs text-status-error">{code}</pre>
  return <div ref={ref} data-shd-mermaid="rendering" className="shd-scrollbar flex justify-center overflow-x-auto py-3 [&_svg]:max-w-full" />
}

function MarkdownCode({ node: _node, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { node?: unknown }) {
  const language = /language-([\w-]+)/.exec(className ?? '')?.[1]
  const code = String(children).replace(/\n$/, '')
  if (language === 'mermaid') return <MermaidDiagram code={code} />
  if (!language) return <code data-shd-inline-code="true" {...props}>{children}</code>
  const highlighted = hljs.getLanguage(language) ? hljs.highlight(code, { language }).value : hljs.highlightAuto(code).value
  return <div className="shd-markdown-code-block overflow-hidden rounded-md border border-stroke-subtle"><div className="shd-markdown-code-toolbar px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-content-tertiary">{language}</div><pre className="shd-scrollbar m-0 max-w-full overflow-x-auto p-3.5"><code className={className} dangerouslySetInnerHTML={{ __html: highlighted }} /></pre></div>
}

function MarkdownPre({ children }: ComponentPropsWithoutRef<'pre'>) {
  return <>{children}</>
}

function MarkdownTable({ node: _node, ...props }: ComponentPropsWithoutRef<'table'> & { node?: unknown }) {
  return <div className="shd-markdown-table-wrap shd-scrollbar" tabIndex={0}><table {...props} /></div>
}

export function MarkdownRenderer({ artifact }: { artifact: Artifact }) {
  const { data, error, loading } = useArtifactText(artifact)
  if (loading) return <RendererLoading label="Loading Markdown" />
  if (error || data === null) return <RendererError message={error ?? 'Markdown is unavailable'} />
  return <article data-shd-artifact-renderer="markdown" className="shd-scrollbar box-border h-full overflow-auto px-6 py-5"><div className="shd-markdown-content mx-auto max-w-[78rem]"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={{ code: MarkdownCode, pre: MarkdownPre, table: MarkdownTable, a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" /> }}>{data}</ReactMarkdown></div></article>
}
