import type { ReactNode } from 'react'
import type { ChatMessage } from '@/types'
import { ChatMessageList } from '@/components/chat/chat-message-list'
import { AIMessageBubble } from '@/components/ai/message-bubble'
import { HexagonLoader } from '@/components/feedback/hexagon-loader'
import { useLocale } from '@/locale'

interface AIMessageListProps {
  messages: ChatMessage[]
  streamingContent?: string
  streamingThinking?: string
  processing?: boolean
  /** Custom empty state content. If omitted, uses built-in default. */
  emptyContent?: ReactNode
}

export function AIMessageList({ messages, streamingContent, streamingThinking, processing, emptyContent: customEmptyContent }: AIMessageListProps) {
  const locale = useLocale()

  const defaultEmptyContent = (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="relative w-36 h-36 mb-3">
        <div className="absolute inset-0 rounded-full border border-holo-cyan/15 animate-pulse" />
        <div className="absolute inset-4 rounded-full border border-holo-cyan/25" />
        <div className="absolute inset-10 rounded-full border border-holo-cyan/35" />
        <div className="absolute inset-0 flex-center">
          <svg className="w-22 h-22 text-holo-cyan/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
      </div>
      <h2 className="text-xl font-light text-white/60 mb-2">{locale.ai.newConversation}</h2>
      <p className="text-sm text-white/30">{locale.ai.newConversationHint}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {[locale.ai.suggestCode, locale.ai.suggestExplain, locale.ai.suggestAnalyze].map((hint) => (
          <span key={hint} className="px-3 py-1.5 rounded-full text-xs text-holo-cyan/60 bg-holo-cyan/10 border border-holo-cyan/15">{hint}</span>
        ))}
      </div>
    </div>
  )

  return (
    <ChatMessageList
      scrollDeps={[messages, streamingContent, streamingThinking]}
      isEmpty={messages.length === 0 && !processing}
      emptyContent={customEmptyContent ?? defaultEmptyContent}
    >
      {messages.map((msg) => <AIMessageBubble key={msg.id} message={msg} />)}

      {streamingThinking && (
        <div className="flex justify-start my-4"><div className="max-w-[85%] px-5 py-4 bg-white/3 backdrop-blur-md border border-holo-cyan/10 rounded-md text-white/40 text-sm whitespace-pre-wrap"><span className="text-white/25 text-xs mr-2">💭</span>{streamingThinking}</div></div>
      )}

      {streamingContent && <AIMessageBubble message={{ id: 'streaming', role: 'assistant', content: streamingContent, timestamp: new Date().toISOString() }} isStreaming />}

      {processing && !streamingContent && (
        <div className="flex justify-start my-4"><div className="flex items-center gap-4 px-5 py-4 bg-holo-blue/6 backdrop-blur-md border border-holo-blue/15 rounded-md">
          <HexagonLoader size={28} /><div><p className="text-sm text-white/80">{locale.ai.thinking}</p><p className="text-xs text-white/35 mt-0.5">{locale.ai.thinkingDescription}</p></div>
        </div></div>
      )}
    </ChatMessageList>
  )
}
