import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import hljs from 'highlight.js'
import { useEffect, useRef, useState, useMemo, useCallback, type ComponentPropsWithoutRef } from 'react'
import mermaid from 'mermaid'
import { isFullHtmlPage } from '@/components/data-display/html-preview'
import { ChatBubble } from '@/components/chat/chat-bubble'
import { useLocale } from '@/locale'
import type { ChatMessage, Artifact } from '@/types'

mermaid.initialize({ startOnLoad: false, theme: 'dark', themeVariables: {
  primaryColor: 'rgba(0, 136, 255, 0.15)',
  primaryBorderColor: 'var(--holo-cyan)',
  primaryTextColor: 'rgba(255, 255, 255, 0.85)',
  lineColor: 'var(--holo-cyan)',
  secondaryColor: 'rgba(0, 255, 255, 0.08)',
  tertiaryColor: 'rgba(0, 26, 40, 0.6)',
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontSize: '13px',
}})

interface AIMessageBubbleProps {
  message: ChatMessage
  isStreaming?: boolean
  onOpenArtifact?: (artifact: Artifact) => void
}

function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const renderIdRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { svg } = await mermaid.render(renderIdRef.current, code.trim())
        if (!cancelled && containerRef.current) containerRef.current.innerHTML = svg
      } catch (e) { if (!cancelled) setError(String(e)) }
    })()
    return () => { cancelled = true }
  }, [code])

  if (error) return <pre className="text-xs text-status-error/70 font-mono whitespace-pre-wrap">{code}</pre>
  return <div ref={containerRef} className="flex justify-center py-2 [&_svg]:max-w-full" />
}

function CodeToolbar({ code, lang, onPreview }: { code: string; lang?: string; onPreview?: () => void }) {
  const locale = useLocale()
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }, [code])

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-scene-void/60 border-b border-holo-blue/10 rounded-t-md">
      <span className="text-[10px] font-mono text-white/25 uppercase">{lang || 'code'}</span>
      <div className="flex items-center gap-1">
        {onPreview && (
          <button onClick={onPreview} className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-holo-cyan/70 hover:text-holo-cyan border border-holo-cyan/15 hover:border-holo-cyan/30 rounded transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            {locale.ai.preview}
          </button>
        )}
        <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded transition-colors">{copied ? locale.ai.copied : locale.ai.copy}</button>
      </div>
    </div>
  )
}

function createCodeBlock(messageId: string, onOpenArtifact?: (artifact: Artifact) => void) {
  let htmlBlockIndex = 0
  return function InternalCodeBlock({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) {
    const lang = className?.replace('language-', '')
    const codeStr = String(children).replace(/\n$/, '')

    if (lang === 'mermaid') return <MermaidBlock code={codeStr} />

    if (lang === 'html' && isFullHtmlPage(codeStr)) {
      const blockIdx = htmlBlockIndex++
      const handlePreview = onOpenArtifact ? () => onOpenArtifact({ id: `${messageId}-html-${blockIdx}`, type: 'html', content: codeStr, messageId }) : undefined
      const highlighted = hljs.highlight(codeStr, { language: 'html' }).value
      return (
        <div className="my-2 rounded-md overflow-hidden border border-holo-blue/15">
          <CodeToolbar code={codeStr} lang="html" onPreview={handlePreview} />
          <pre className="m-0 p-4 bg-scene-void/80 overflow-auto text-sm" style={{ maxHeight: 300 }}><code className="language-html" dangerouslySetInnerHTML={{ __html: highlighted }} {...props} /></pre>
        </div>
      )
    }

    const highlighted = lang ? (hljs.getLanguage(lang) ? hljs.highlight(codeStr, { language: lang }).value : hljs.highlightAuto(codeStr).value) : null
    if (highlighted) return <code className={className} dangerouslySetInnerHTML={{ __html: highlighted }} {...props} />
    return <code className={className} {...props}>{children}</code>
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

export function AIMessageBubble({ message, isStreaming = false, onOpenArtifact }: AIMessageBubbleProps) {
  const isUser = message.role === 'user'
  const isTool = message.role === 'tool'

  if (isTool) {
    return (
      <div className="flex justify-center my-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-status-success/10 via-holo-cyan/10 to-status-success/10 border border-status-success/20 rounded-full backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" style={{ boxShadow: '0 0 8px var(--color-success)' }} />
          <span className="text-sm font-mono text-status-success">{message.toolName}</span>
          {message.toolResult && (
            <><svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg><span className="text-sm text-white/50 max-w-[200px] truncate">{message.toolResult}</span></>
          )}
        </div>
      </div>
    )
  }

  const effectiveOnOpen = isStreaming ? undefined : onOpenArtifact
  const CodeBlock = useMemo(() => createCodeBlock(message.id, effectiveOnOpen), [message.id, effectiveOnOpen])

  return (
    <ChatBubble align={isUser ? 'right' : 'left'} streaming={isStreaming} timestamp={message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : undefined}>
      <div className={`prose prose-sm max-w-none ${isUser ? 'text-white/90' : 'text-white/85'} ${isStreaming ? 'typing-cursor' : ''}`}>
        <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={{ code: CodeBlock }}>{normalizeMath(message.content || ' ')}</ReactMarkdown>
      </div>
    </ChatBubble>
  )
}
