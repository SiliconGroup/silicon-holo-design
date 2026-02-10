import { useState, useRef, useEffect, useCallback } from 'react'
import hljs from 'highlight.js'
import { HoloTab } from '@/components/navigation/tabs'
import { useLocale } from '@/locale'

interface HtmlPreviewBlockProps {
  /** 完整 HTML 源码 */
  code: string
}

/**
 * HTML 代码/预览切换组件
 *
 * 渲染策略：
 * 1. iframe 先以容器自然尺寸渲染（width=容器宽度, height=可用高度）
 * 2. 内容渲染完后检测是否溢出
 * 3. 无溢出 → 高度自适应内容，不缩放
 * 4. 有溢出 → 计算 scale，iframe 放大到 容器尺寸/scale，再 transform: scale 缩回
 */
export function HtmlPreviewBlock({ code }: HtmlPreviewBlockProps) {
  const locale = useLocale()
  const [mode, setMode] = useState<'code' | 'preview'>('code')
  const codeRef = useRef<HTMLElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{
    iframeW: string | number
    iframeH: number
    wrapH: number
    scale: number
  }>({ iframeW: '100%', iframeH: 400, wrapH: 400, scale: 1 })

  useEffect(() => {
    if (mode === 'code' && codeRef.current && !codeRef.current.dataset.highlighted) {
      hljs.highlightElement(codeRef.current)
      codeRef.current.dataset.highlighted = 'true'
    }
  }, [mode])

  const getAvailableHeight = useCallback(() => {
    let el = containerRef.current?.parentElement
    while (el) {
      if (el.scrollHeight > el.clientHeight && el.clientHeight > 0) {
        return el.clientHeight - 80
      }
      el = el.parentElement
    }
    return window.innerHeight - 200
  }, [])

  const fitContent = useCallback(() => {
    const iframe = iframeRef.current
    const container = containerRef.current
    if (!iframe || !container) return

    const containerW = container.clientWidth
    const maxH = getAvailableHeight()

    try {
      const body = iframe.contentDocument?.body
      const html = iframe.contentDocument?.documentElement
      if (!body || !html) return

      const scrollW = Math.max(body.scrollWidth, html.scrollWidth)
      const scrollH = Math.max(body.scrollHeight, html.scrollHeight)
      if (scrollW <= 0 || scrollH <= 0) return

      const overflowX = scrollW > containerW + 2 // 2px 容差
      const overflowY = scrollH > maxH

      if (!overflowX && !overflowY) {
        // 无溢出：高度自适应内容
        setLayout({ iframeW: '100%', iframeH: scrollH, wrapH: scrollH, scale: 1 })
      } else {
        // 有溢出：计算缩放
        const scaleX = overflowX ? containerW / scrollW : 1
        const scaleY = overflowY ? maxH / scrollH : 1
        const s = Math.min(scaleX, scaleY)
        // iframe 放大到 容器/scale，再 transform scale 缩回
        setLayout({
          iframeW: containerW / s,
          iframeH: Math.max(scrollH, maxH / s),
          wrapH: Math.round(Math.max(scrollH, maxH / s) * s),
          scale: s,
        })
      }
    } catch {
      // cross-origin fallback
      setLayout({ iframeW: '100%', iframeH: 400, wrapH: 400, scale: 1 })
    }
  }, [getAvailableHeight])

  const handleIframeLoad = useCallback(() => {
    // 先重置为自然尺寸让内容正常布局
    setLayout({ iframeW: '100%', iframeH: getAvailableHeight(), wrapH: getAvailableHeight(), scale: 1 })
    // 等内容渲染稳定后测量
    requestAnimationFrame(() => {
      setTimeout(fitContent, 50)
      setTimeout(fitContent, 300)
    })
  }, [fitContent, getAvailableHeight])

  // 切回代码时重置
  useEffect(() => {
    if (mode === 'code') {
      setLayout({ iframeW: '100%', iframeH: 400, wrapH: 400, scale: 1 })
    }
  }, [mode])

  return (
    <div ref={containerRef} className="my-2 rounded-md overflow-hidden border border-holo-blue/15">
      {/* 工具栏 */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-scene-void/60 border-b border-holo-blue/10">
        <HoloTab
          items={[
            { key: 'code', label: locale.chat.codeTab, icon: <CodeIcon /> },
            { key: 'preview', label: locale.chat.previewTab, icon: <PreviewIcon /> },
          ]}
          activeKey={mode}
          onChange={(key) => setMode(key as 'code' | 'preview')}
        />
        <div className="flex-1" />
        {mode === 'preview' && layout.scale < 0.99 && (
          <span className="text-[10px] font-mono text-white/30">{Math.round(layout.scale * 100)}%</span>
        )}
        <span className="text-[10px] font-mono text-white/25 uppercase ml-2">html</span>
      </div>

      {/* 内容区 */}
      {mode === 'code' ? (
        <pre className="m-0 p-4 bg-scene-void/80 overflow-auto text-sm" style={{ maxHeight: 500 }}>
          <code ref={codeRef} className="language-html">{code}</code>
        </pre>
      ) : (
        <div className="overflow-hidden" style={{ height: layout.wrapH }}>
          <iframe
            ref={iframeRef}
            srcDoc={code}
            sandbox="allow-scripts allow-same-origin"
            className="border-0"
            style={{
              width: layout.iframeW,
              height: layout.iframeH,
              transform: layout.scale < 0.99 ? `scale(${layout.scale})` : undefined,
              transformOrigin: 'top left',
            }}
            title="HTML Preview"
            onLoad={handleIframeLoad}
          />
        </div>
      )}
    </div>
  )
}

/** 判断代码是否为完整 HTML 页面 */
export function isFullHtmlPage(code: string): boolean {
  const trimmed = code.trimStart().toLowerCase()
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')
}

/* ---- 内部子组件 ---- */

function CodeIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}

function PreviewIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}
