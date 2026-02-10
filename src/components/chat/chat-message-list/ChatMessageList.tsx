import { useRef, useEffect, type ReactNode } from 'react'

interface ChatMessageListProps {
  /** 滚动依赖项，变化时自动滚到底部 */
  scrollDeps?: unknown[]
  /** 空状态内容 */
  emptyContent?: ReactNode
  /** 是否为空 */
  isEmpty?: boolean
  children: ReactNode
  className?: string
}

export function ChatMessageList({ scrollDeps = [], emptyContent, isEmpty, children, className }: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, scrollDeps)

  return (
    <div ref={containerRef} className={`flex-1 overflow-y-auto px-6 py-8 ${className ?? ''}`}>
      {isEmpty && emptyContent ? emptyContent : children}
    </div>
  )
}
