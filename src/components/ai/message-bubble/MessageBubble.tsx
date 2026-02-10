import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js'
import { useEffect, useRef, useId, useState, type ComponentPropsWithoutRef } from 'react'
import mermaid from 'mermaid'
import { HtmlPreviewBlock, isFullHtmlPage } from '@/components/ai/html-preview'
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

interface MessageBubbleProps {
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
function CodeBlock({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) {
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

/** 角落电路装饰 SVG */
function CornerCircuit({ isUser }: { isUser: boolean }) {
  const color = isUser ? 'var(--holo-cyan)' : 'var(--holo-blue, #0088ff)'
  return (
    <svg
      className={`absolute ${isUser ? 'bottom-0 right-0' : 'top-0 left-0'} w-8 h-8 pointer-events-none`}
      viewBox="0 0 32 32"
    >
      {isUser ? (
        <>
          <path d="M32,32 L32,20 L28,20 L28,28 L20,28 L20,32 Z" fill={color} fillOpacity="0.08" />
          <path d="M32,24 L28,24 L28,28 L24,28" fill="none" stroke={color} strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="28" cy="28" r="1" fill={color} fillOpacity="0.3" />
        </>
      ) : (
        <>
          <path d="M0,0 L0,12 L4,12 L4,4 L12,4 L12,0 Z" fill={color} fillOpacity="0.08" />
          <path d="M0,8 L4,8 L4,4 L8,4" fill="none" stroke={color} strokeOpacity="0.2" strokeWidth="0.5" />
          <circle cx="4" cy="4" r="1" fill={color} fillOpacity="0.3" />
        </>
      )}
    </svg>
  )
}

/** 气泡内部背景网格纹理 */
function BubbleGrid({ id, isUser }: { id: string; isUser: boolean }) {
  const color = isUser ? 'rgba(0,255,255,' : 'rgba(0,136,255,'
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24,0 L0,0 L0,24" fill="none" stroke={`${color}0.04)`} strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

const remarkPlugins = [remarkGfm]

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const gridId = useId()

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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-4`}>
      <div
        className={`
          relative max-w-[75%] rounded-md overflow-hidden backdrop-blur-md border
          ${isUser
            ? 'bg-holo-cyan/8 border-holo-cyan/20'
            : 'bg-holo-blue/6 border-holo-blue/15'
          }
          ${isStreaming ? 'shadow-[0_0_20px_rgba(0,136,255,0.15)]' : ''}
        `}
      >
        {/* 背景网格纹理 */}
        <BubbleGrid id={gridId} isUser={isUser} />

        {/* 顶部光线 */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: isUser
              ? 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.4), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(0, 136, 255, 0.3), transparent)',
          }}
        />

        {/* 角落电路装饰 */}
        <CornerCircuit isUser={isUser} />

        {/* 内容 */}
        <div className="relative px-4 py-3">
          <div className={`
            prose prose-sm max-w-none
            ${isUser ? 'text-white/90' : 'text-white/85'}
            ${isStreaming ? 'typing-cursor' : ''}
          `}>
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              components={{ code: CodeBlock }}
            >
              {message.content || ' '}
            </ReactMarkdown>
          </div>
        </div>

        {/* 时间戳 */}
        <div className="relative px-4 pb-2 flex items-center gap-2">
          <div className={`flex-1 h-[1px] bg-gradient-to-r from-transparent ${isUser ? 'via-holo-cyan/15' : 'via-holo-blue/12'} to-transparent`} />
          <span className={`text-[10px] font-mono ${isUser ? 'text-holo-cyan/50' : 'text-holo-blue/45'}`}>
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
          </span>
          <div className={`flex-1 h-[1px] bg-gradient-to-r from-transparent ${isUser ? 'via-holo-cyan/15' : 'via-holo-blue/12'} to-transparent`} />
        </div>

        {/* 流式动画 */}
        {isStreaming && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-transparent via-holo-blue to-transparent"
              style={{ animation: 'shimmer 1.5s infinite', width: '50%' }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  )
}
