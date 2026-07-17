import type { ReactNode } from 'react'
import type { ChatMessage, Artifact } from '@/types'
import { AIMessageList } from '@/components/ai/message-list'
import { ChatInputArea } from '@/components/chat/chat-input'
import { useLocale } from '@/locale'

interface AIChatContainerProps {
  messages?: ChatMessage[]
  onSend: (message: string) => void
  processing?: boolean
  streamingContent?: string
  streamingThinking?: string
  showEmptyState?: boolean
  noSessionContent?: ReactNode
  emptyContent?: ReactNode
  onOpenArtifact?: (artifact: Artifact) => void
}

export function AIChatContainer({ messages = [], onSend, processing, streamingContent, streamingThinking, showEmptyState, noSessionContent, emptyContent, onOpenArtifact }: AIChatContainerProps) {
  const locale = useLocale()
  if (showEmptyState) {
    return (
      <div className="flex-1 flex flex-col relative min-h-0">
        <div className="flex-1 flex items-center justify-center min-h-0">
          {noSessionContent ?? (
            <div className="relative text-center">
              <h2 className="text-2xl font-medium text-content-primary mb-3">{locale.ai.selectSession}</h2>
              <p className="text-content-tertiary max-w-md">{locale.ai.selectSessionHint}</p>
            </div>
          )}
        </div>
        <div className="relative px-6 pb-5 pt-2 flex-shrink-0"><ChatInputArea onSend={onSend} disabled={processing} /></div>
      </div>
    )
  }
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
      <AIMessageList messages={messages} streamingContent={streamingContent} streamingThinking={streamingThinking} processing={processing} emptyContent={emptyContent} onOpenArtifact={onOpenArtifact} />
      <div className="relative px-6 pb-5 pt-2 flex-shrink-0"><ChatInputArea onSend={onSend} disabled={processing} /></div>
    </div>
  )
}
