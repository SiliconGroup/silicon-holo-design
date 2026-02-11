import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import hljs from 'highlight.js'
import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import mermaid from 'mermaid'
import { HtmlPreviewBlock, isFullHtmlPage } from '@/components/data-display/html-preview'
import { ChatBubble } from '@/components/chat/chat-bubble'
import type { ChatMessage } from '@/types'

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
}

/** Mermaid 图表渲染 */
function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const renderIdRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { svg } = await mermaid.render(renderIdRef.current, code.trim())
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    })()
    return () => { cancelled = true }
  }, [code])

  if (error) {
    return <pre className="text-xs text-status-error/70 font-mono whitespace-pre-wrap">{code}</pre>
  }

  return <div ref={containerRef} className="flex justify-center py-2 [&_svg]:max-w-full" />
}

/** 自定义 code 渲染：mermaid → 图表，html 完整页面 → 预览，其他 → highlight.js */
function InternalCodeBlock({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) {
  const lang = className?.replace('language-', '')
  const codeStr = String(children).replace(/\n$/, '')

  if (lang === 'mermaid') {
    return <MermaidBlock code={codeStr} />
  }

  if (lang === 'html' && isFullHtmlPage(codeStr)) {
    return <HtmlPreviewBlock code={codeStr} />
  }

  const highlighted = lang
    ? hljs.getLanguage(lang)
      ? hljs.highlight(codeStr, { language: lang }).value
      : hljs.highlightAuto(codeStr).value
    : null

  if (highlighted) {
    return <code className={className} dangerouslySetInnerHTML={{ __html: highlighted }} {...props} />
  }

  return <code className={className} {...props}>{children}</code>
}

const remarkPlugins = [remarkGfm, remarkMath]
const rehypePlugins = [rehypeKatex]

export function AIMessageBubble({ message, isStreaming = false }: AIMessageBubbleProps) {
  const isUser = message.role === 'user'
  const isTool = message.role === 'tool'

  if (isTool) {
    return (
      <div className="flex justify-center my-4">
        <div className="
          inline-flex items-center gap-3 px-4 py-2
          bg-gradient-to-r from-status-success/10 via-holo-cyan/10 to-status-success/10
          border border-status-success/20 rounded-full backdrop-blur-sm
        ">
          <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" style={{ boxShadow: '0 0 8px var(--color-success)' }} />
          <span className="text-sm font-mono text-status-success">{message.toolName}</span>
          {message.toolResult && (
            <>
              <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm text-white/50 max-w-[200px] truncate">{message.toolResult}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <ChatBubble
      align={isUser ? 'right' : 'left'}
      streaming={isStreaming}
      timestamp={message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : undefined}
    >
      <div className={`
        prose prose-sm max-w-none
        ${isUser ? 'text-white/90' : 'text-white/85'}
        ${isStreaming ? 'typing-cursor' : ''}
      `}>
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={{ code: InternalCodeBlock }}
        >
          {message.content || ' '}
        </ReactMarkdown>
      </div>
    </ChatBubble>
  )
}
