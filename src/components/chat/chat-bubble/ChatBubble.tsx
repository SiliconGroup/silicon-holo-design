import type { ReactNode } from 'react'

interface ChatBubbleProps {
  align: 'left' | 'right'
  streaming?: boolean
  timestamp?: string
  children: ReactNode
  className?: string
}

export function ChatBubble({ align, streaming, timestamp, children, className }: ChatBubbleProps) {
  const isRight = align === 'right'

  return (
    <div className={`flex ${isRight ? 'justify-end' : 'justify-start'} my-4`}>
      <div
        data-shd-chat-bubble={isRight ? 'user' : 'assistant'}
        data-shd-state={streaming ? 'running' : undefined}
        className={`shd-chat-bubble box-border group/bubble max-w-[78%] text-content-primary ${isRight ? 'shd-chat-bubble-user rounded-l-md rounded-tr-md rounded-br-sm' : 'shd-chat-bubble-assistant rounded-r-md rounded-tl-md rounded-bl-sm'} ${className ?? ''}`}
      >
        <div className="shd-chat-bubble-content">{children}</div>
        {(timestamp || streaming) && (
          <div className="shd-chat-bubble-meta flex items-center justify-end gap-2 px-[18px] pb-2 pt-1">
            {streaming && (
              <span data-shd-motion="status" className="inline-flex items-center gap-1" aria-label="Streaming">
                <span className="h-1 w-1 rounded-full bg-accent-primary animate-pulse" />
                <span className="h-1 w-1 rounded-full bg-accent-primary animate-pulse [animation-delay:120ms]" />
                <span className="h-1 w-1 rounded-full bg-accent-primary animate-pulse [animation-delay:240ms]" />
              </span>
            )}
            {timestamp && <span suppressHydrationWarning className="font-mono text-[10px] text-content-tertiary">{timestamp}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
