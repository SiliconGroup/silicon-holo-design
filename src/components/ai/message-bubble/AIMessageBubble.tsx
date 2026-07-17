import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import hljs from 'highlight.js'
import { useEffect, useRef, useState, useMemo, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { isFullHtmlPage } from '@/components/data-display/html-preview'
import { ChatBubble } from '@/components/chat/chat-bubble'
import { AIToolCallCard } from '@/components/ai/tool-call-card'
import { CopyAction } from '@/components/ai/copy-action/CopyAction'
import { useLocale } from '@/locale'
import type { ChatMessage, Artifact } from '@/types'

interface AIMessageBubbleProps {
  message: ChatMessage
  isStreaming?: boolean
  onOpenArtifact?: (artifact: Artifact) => void
  /** 是否启用消息复制按钮（默认 false，保持向后兼容） */
  enableCopy?: boolean
  /** 自定义操作区，渲染在复制按钮之后 */
  actions?: ReactNode
  /** 自定义 Markdown 渲染组件，合并到 ReactMarkdown 的 components 中 */
  markdownComponents?: Record<string, React.ComponentType<unknown>>
}

type AIMessageBubblePropsWithMarkdown = Omit<AIMessageBubbleProps, 'markdownComponents'> & { markdownComponents?: Components }

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
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = resolved || fallback
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data
  return `rgba(${red}, ${green}, ${blue}, ${(alpha / 255).toFixed(3)})`
}

function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const renderIdRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { default: mermaid } = await import('mermaid')
        const container = containerRef.current
        if (!container) return
        mermaid.initialize({ startOnLoad: false, theme: 'dark', themeVariables: {
          primaryColor: resolveMermaidColor(container, '--shd-accent-primary-soft', 'rgba(56, 215, 231, 0.12)'),
          primaryBorderColor: resolveMermaidColor(container, '--shd-stroke-accent', 'rgba(69, 218, 229, 0.52)'),
          primaryTextColor: resolveMermaidColor(container, '--shd-content-primary', 'rgba(255, 255, 255, 0.95)'),
          lineColor: resolveMermaidColor(container, '--shd-accent-primary-hover', '#65e2ee'),
          secondaryColor: resolveMermaidColor(container, '--shd-accent-primary-softer', 'rgba(56, 215, 231, 0.07)'),
          tertiaryColor: resolveMermaidColor(container, '--shd-surface-base', '#001219'),
          fontFamily: 'Inter, -apple-system, sans-serif',
          fontSize: '13px',
        }})
        const { svg } = await mermaid.render(renderIdRef.current, code.trim())
        if (!cancelled && containerRef.current) containerRef.current.innerHTML = svg
      } catch (e) { if (!cancelled) setError(String(e)) }
    })()
    return () => { cancelled = true }
  }, [code])

  if (error) return <pre data-shd-mermaid="error" data-shd-mermaid-error={error} className="text-xs text-status-error font-mono whitespace-pre-wrap">{code}</pre>
  return <div ref={containerRef} data-shd-mermaid="rendering" className="flex justify-center py-2 [&_svg]:max-w-full" />
}

/** 紧凑的 Artifact 卡片，替代气泡内的代码块 */
function ArtifactCard({ code, onPreview, onCopy }: { code: string; onPreview?: () => void; onCopy: () => void | Promise<void> }) {
  const locale = useLocale()
  const previewContent = (
    <>
      <span className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center bg-accent-primary-softer border border-stroke-default">
        <svg className="w-4 h-4 text-content-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
      </span>
      <span className="flex-1 min-w-0 text-left text-xs font-mono text-content-accent uppercase">html</span>
    </>
  )

  return (
    <div className="shd-spectral-panel relative my-2 flex items-center gap-3 px-3 py-2 rounded-md border border-stroke-subtle hover:border-stroke-accent transition-colors duration-150 overflow-hidden">
      {onPreview ? (
        <button type="button" onClick={onPreview} className="shd-control-focus border-none bg-transparent flex min-w-0 flex-1 items-center gap-3 rounded-sm p-1">{previewContent}</button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 p-1">{previewContent}</div>
      )}
      <div className="flex items-center gap-1">
        <CopyAction onCopy={onCopy} />
        {onPreview && (
          <button type="button" onClick={onPreview} className="shd-control-focus border-none bg-transparent flex items-center gap-1 px-2 py-1 text-[11px] text-content-accent hover:text-accent-primary-hover rounded transition-colors duration-150">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {locale.ai.preview}
          </button>
        )}
      </div>
    </div>
  )
}

function MarkdownCodeBlock({ code, language, highlighted }: { code: string; language?: string; highlighted?: string }) {
  const locale = useLocale()
  const label = language?.trim() || 'code'

  return (
    <div data-shd-markdown-code-block="true" className="shd-markdown-code-block my-3 max-w-full overflow-hidden rounded-sm border border-stroke-muted">
      <div className="shd-markdown-code-toolbar flex items-center justify-between border-b border-stroke-muted px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-tertiary">{label}</span>
        <CopyAction content={code} label={`${locale.ai.copy} ${label}`} />
      </div>
      <pre className="m-0 max-w-full overflow-x-auto p-3.5 text-left font-mono text-[12px] leading-[1.65] text-content-secondary">
        {highlighted
          ? <code className={`hljs language-${label}`} dangerouslySetInnerHTML={{ __html: highlighted }} />
          : <code>{code}</code>}
      </pre>
    </div>
  )
}

function MarkdownPre({ children }: ComponentPropsWithoutRef<'pre'>) {
  return <>{children}</>
}

function MarkdownTable({ node: _node, ...props }: ComponentPropsWithoutRef<'table'> & { node?: unknown }) {
  return <div className="shd-markdown-table-wrap shd-scrollbar" tabIndex={0}><table {...props} /></div>
}

function createCodeBlock(messageId: string, onOpenArtifact?: (artifact: Artifact) => void) {
  return function InternalCodeBlock({ className, children, node, ...props }: ComponentPropsWithoutRef<'code'> & { node?: { position?: { start: { line: number }; end: { line: number } } } }) {
    const lang = className?.replace('language-', '')
    const codeStr = String(children).replace(/\n$/, '')
    const isBlock = Boolean(lang) || Boolean(node?.position && node.position.end.line > node.position.start.line)

    if (!isBlock) return <code data-shd-inline-code="true" className={className} {...props}>{children}</code>

    if (lang === 'mermaid') return <MermaidBlock code={codeStr} />

    if (lang === 'html' && isFullHtmlPage(codeStr)) {
      let hash = 2166136261
      for (let index = 0; index < codeStr.length; index += 1) hash = Math.imul(hash ^ codeStr.charCodeAt(index), 16777619)
      const artifactId = `${messageId}-html-${(hash >>> 0).toString(36)}`
      const handlePreview = onOpenArtifact ? () => onOpenArtifact({ id: artifactId, type: 'html', content: codeStr, messageId }) : undefined
      return <ArtifactCard code={codeStr} onPreview={handlePreview} onCopy={() => navigator.clipboard.writeText(codeStr)} />
    }

    const highlighted = lang ? (hljs.getLanguage(lang) ? hljs.highlight(codeStr, { language: lang }).value : hljs.highlightAuto(codeStr).value) : undefined
    return <MarkdownCodeBlock code={codeStr} language={lang} highlighted={highlighted} />
  }
}

function normalizeMath(s: string): string {
  return s.replace(/(```[\s\S]*?```)|(\\\[[\s\S]*?\\\])|(\\\([\s\S]*?\\\))/g, (m, code, block, inline) => {
    if (code) return code
    if (block) return `$$${block.slice(2, -2)}$$`
    return `$${inline.slice(2, -2)}$`
  })
}

const remarkPlugins = [remarkGfm, remarkMath]
const rehypePlugins = [rehypeKatex]

function formatStableTimestamp(timestamp?: string) {
  if (!timestamp) return undefined
  const isoTime = /T(\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/.exec(timestamp)
  return isoTime?.[1] ?? timestamp
}

function formatLocalTimestamp(timestamp?: string) {
  if (!timestamp) return undefined
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleTimeString()
}

export function AIMessageBubble(props: AIMessageBubbleProps): import('react/jsx-runtime').JSX.Element
export function AIMessageBubble(props: AIMessageBubblePropsWithMarkdown): import('react/jsx-runtime').JSX.Element
export function AIMessageBubble({ message, isStreaming = false, onOpenArtifact, enableCopy = false, actions, markdownComponents }: AIMessageBubblePropsWithMarkdown) {
  const [displayTimestamp, setDisplayTimestamp] = useState(() => formatStableTimestamp(message.timestamp))
  const isUser = message.role === 'user'
  const isTool = message.role === 'tool'
  const effectiveOnOpen = isStreaming ? undefined : onOpenArtifact
  const CodeBlock = useMemo(() => createCodeBlock(message.id, effectiveOnOpen), [message.id, effectiveOnOpen])

  useEffect(() => {
    setDisplayTimestamp(formatLocalTimestamp(message.timestamp))
  }, [message.timestamp])

  if (isTool && message.toolName) {
    return (
      <div className="my-4 flex justify-start">
        <div className="w-full max-w-[78%]">
          <AIToolCallCard
            name={message.toolName}
            status={message.toolStatus || 'pending'}
            arguments={message.toolArguments}
            result={message.toolResult}
            durationMs={message.toolDuration}
          />
        </div>
      </div>
    )
  }

  return (
    <ChatBubble align={isUser ? 'right' : 'left'} streaming={isStreaming} timestamp={displayTimestamp}>
      <div className={`not-prose shd-markdown-content max-w-none ${isStreaming ? 'typing-cursor' : ''}`}>
        <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={{ pre: MarkdownPre, code: CodeBlock, table: MarkdownTable, ...markdownComponents }}>{normalizeMath(message.content || ' ')}</ReactMarkdown>
      </div>
      {!isStreaming && (enableCopy || actions) && (
        <div className="relative flex items-center justify-end gap-1 pt-1 opacity-60 transition-opacity duration-200 group-hover/bubble:opacity-100 group-focus-within/bubble:opacity-100">
          {enableCopy && <CopyAction content={message.content} />}
          {actions}
        </div>
      )}
    </ChatBubble>
  )
}
