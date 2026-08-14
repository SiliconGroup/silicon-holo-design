import { useEffect, useMemo, useRef } from 'react'
import hljs from 'highlight.js'
import { HoloEmpty } from '@/components/data-display/empty'
import { formatMessage } from '@/locale'
import type { HoloCodeViewProps } from '../types'
import { formatBytes, useStudioLocale } from '../utils/use-studio-locale'
import { splitHighlightedLines } from './code-highlight'

const DEFAULT_MAX_RENDER_BYTES = 512 * 1024

function measureBytes(value: string, known?: number) {
  if (typeof known === 'number') return known
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(value).length
  return value.length
}

function highlight(value: string, languageId?: string) {
  if (languageId && hljs.getLanguage(languageId)) return hljs.highlight(value, { language: languageId }).value
  return hljs.highlightAuto(value).value
}

/**
 * 只读代码视图。复用库内既有的 highlight.js 与 .hljs-* 配色，新增 0 KB 依赖。
 * 需要编辑能力时改为注入 HoloCodeEditor（见 ./studio/editor）。
 */
export function HoloCodeView({
  value,
  languageId,
  readOnly = true,
  onChange,
  onSaveIntent,
  highlightLines,
  revealLine,
  showLineNumbers = true,
  wrap = false,
  byteSize,
  maxRenderBytes = DEFAULT_MAX_RENDER_BYTES,
  onExceedLimit,
  ariaLabel,
  className = '',
}: HoloCodeViewProps) {
  const locale = useStudioLocale()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bytes = useMemo(() => measureBytes(value, byteSize), [value, byteSize])
  const exceeded = bytes > maxRenderBytes

  useEffect(() => {
    if (exceeded) onExceedLimit?.(bytes)
  }, [bytes, exceeded, onExceedLimit])

  useEffect(() => {
    if (readOnly || import.meta.env?.PROD) return
    // 只读视图无法编辑；提示宿主注入 ./studio/editor 的 HoloCodeEditor。
    console.warn('[HoloCodeView] readOnly={false} has no effect. Inject HoloCodeEditor as codeRenderer to enable editing.')
  }, [readOnly])

  const lines = useMemo(() => (exceeded ? [] : value.split('\n')), [exceeded, value])
  const highlightedLines = useMemo(() => (exceeded ? [] : splitHighlightedLines(highlight(value, languageId))), [exceeded, languageId, value])

  const emphasised = useMemo(() => new Set(highlightLines ?? []), [highlightLines])

  useEffect(() => {
    const element = scrollRef.current
    if (!element || revealLine === undefined || exceeded) return
    const row = element.querySelector<HTMLElement>(`[data-shd-code-line="${revealLine}"]`)
    if (!row) return
    // 布局尚未成形时（clientHeight 为 0）不要滚动，否则会误判成「该行在视口外」而滚到奇怪的位置。
    if (element.clientHeight === 0) return
    /*
     * 用 getBoundingClientRect 的差值而不是 offsetTop：
     * offsetTop 是相对最近的**定位**祖先，而滚动容器本身没有 position，
     * 用它会得到与滚动容器无关的数值，导致已经可见的行也被滚走。
     */
    const containerTop = element.getBoundingClientRect().top
    const rowRect = row.getBoundingClientRect()
    const top = rowRect.top - containerTop + element.scrollTop
    const visibleFrom = element.scrollTop
    const visibleTo = visibleFrom + element.clientHeight
    if (top < visibleFrom || top + rowRect.height > visibleTo) {
      element.scrollTop = Math.max(0, top - element.clientHeight / 3)
    }
  }, [exceeded, revealLine, value])

  void onChange
  void onSaveIntent

  if (exceeded) {
    return (
      <div className={`shd-surface-inset flex min-h-0 flex-1 items-center justify-center ${className}`}>
        <HoloEmpty description={formatMessage(locale.fileTooLarge, { size: formatBytes(bytes), limit: formatBytes(maxRenderBytes) })} />
      </div>
    )
  }

  const gutterWidth = `${String(lines.length).length + 1}ch`

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label={ariaLabel ?? locale.codeLabel}
      className={`shd-scrollbar shd-surface-inset min-h-0 flex-1 overflow-auto font-mono text-sm leading-relaxed ${className}`}
    >
      <div className="min-w-max py-2">
        {lines.map((_, index) => {
          const lineNumber = index + 1
          return (
            <div
              key={lineNumber}
              data-shd-code-line={lineNumber}
              className={`flex ${emphasised.has(lineNumber) ? 'bg-accent-primary-softer' : ''}`}
            >
              {showLineNumbers && <span
                aria-hidden="true"
                className="flex-none select-none border-r border-stroke-muted pr-2 text-right text-content-disabled"
                style={{ width: gutterWidth }}
              >
                {lineNumber}
              </span>}
              <code
                className={`hljs block flex-1 px-3 ${wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}`}
                dangerouslySetInnerHTML={{ __html: highlightedLines[index] ?? '' }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
