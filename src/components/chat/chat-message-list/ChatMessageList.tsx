import { useEffect, useRef, type ReactNode, type UIEvent } from 'react'

interface ChatMessageListProps {
  /** 滚动依赖项，变化时在用户仍位于底部附近时自动滚到底部 */
  scrollDeps?: unknown[]
  /** 空状态内容 */
  emptyContent?: ReactNode
  /** 是否为空 */
  isEmpty?: boolean
  children: ReactNode
  className?: string
}

function dependenciesChanged(previous: unknown[] | undefined, current: unknown[]) {
  return !previous
    || previous.length !== current.length
    || current.some((value, index) => !Object.is(value, previous[index]))
}

export function ChatMessageList({ scrollDeps = [], emptyContent, isEmpty, children, className }: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousDepsRef = useRef<unknown[]>()
  const shouldAutoScrollRef = useRef(true)

  useEffect(() => {
    if (dependenciesChanged(previousDepsRef.current, scrollDeps) && shouldAutoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
    previousDepsRef.current = [...scrollDeps]
  })

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    shouldAutoScrollRef.current = element.scrollHeight - element.scrollTop - element.clientHeight <= 48
  }

  return (
    <div data-shd-message-scroll="true" ref={containerRef} onScroll={handleScroll} className={`shd-scrollbar flex-1 overflow-y-auto px-6 py-8 ${className ?? ''}`}>
      {isEmpty && emptyContent ? emptyContent : children}
    </div>
  )
}
