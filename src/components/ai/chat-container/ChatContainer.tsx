import type { ChatMessage } from '@/types'
import { MessageList } from '@/components/ai/message-list'
import { ChatInputArea } from '@/components/ai/chat-input'
import { useLocale } from '@/locale'

interface ChatContainerProps {
  messages?: ChatMessage[]; onSend: (message: string) => void; processing?: boolean
  streamingContent?: string; streamingThinking?: string; showEmptyState?: boolean
}

export function ChatContainer({ messages = [], onSend, processing, streamingContent, streamingThinking, showEmptyState }: ChatContainerProps) {
  const locale = useLocale()
  if (showEmptyState) {
    return (
      <div className="flex-1 flex flex-col relative min-h-0">
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.02) 0%, transparent 70%)' }} />
          </div>
          <div className="relative text-center">
            <h2 className="text-2xl font-light holo-text mb-3">{locale.ai.selectSession}</h2>
            <p className="text-white/40 max-w-md">{locale.ai.selectSessionHint}</p>
          </div>
        </div>
        <div className="relative px-6 pb-5 pt-2 flex-shrink-0"><ChatInputArea onSend={onSend} disabled={processing} /></div>
      </div>
    )
  }
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-scene-void/50 to-transparent pointer-events-none z-10" />
      <MessageList messages={messages} streamingContent={streamingContent} streamingThinking={streamingThinking} processing={processing} />
      <div className="relative px-6 pb-5 pt-2 flex-shrink-0"><ChatInputArea onSend={onSend} disabled={processing} /></div>
    </div>
  )
}
