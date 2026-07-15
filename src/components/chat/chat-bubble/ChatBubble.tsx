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
      <div data-shd-chat-bubble={isRight ? 'user' : 'assistant'} className={`group/bubble max-w-[78%] rounded-md ${isRight ? 'bg-accent-primary-softer border-r-2 border-r-stroke-accent' : `shd-spectral-panel-raised border-l-2 ${streaming ? 'border-l-stroke-accent' : 'border-l-stroke-subtle'}`} ${className ?? ''}`}>
        <div className="px-4 py-3">{children}</div>
        {(timestamp || streaming) && (
          <div className="flex items-center justify-end gap-2 px-4 pb-2">
            {streaming && (
              <span data-shd-motion="status" className="inline-flex items-center gap-1" aria-label="Streaming">
                <span className="h-1 w-1 rounded-full bg-accent-primary animate-pulse" />
                <span className="h-1 w-1 rounded-full bg-accent-primary animate-pulse [animation-delay:120ms]" />
                <span className="h-1 w-1 rounded-full bg-accent-primary animate-pulse [animation-delay:240ms]" />
              </span>
            )}
            {timestamp && <span className="font-mono text-[10px] text-content-tertiary">{timestamp}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
